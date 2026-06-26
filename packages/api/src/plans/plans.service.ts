import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AnimeTranslationService } from './anime-translation.service';
import { getTitleOverride } from './anime-title-overrides';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CalendarQueryDto, CalendarRefreshQueryDto } from './dto/calendar-query.dto';
import { PlansQueryDto } from './dto/plans-query.dto';
import {
  CalendarItemResponseDto,
  CalendarListResponseDto,
  CalendarRefreshResponseDto,
  PlanResponseDto,
} from './dto/responses/plans-response.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';
import {
  PlanActivityType,
  PlanActivityTypeFilter,
  PlanStatus,
  PlanStatusFilter,
  SimklMediaType,
  SimklMediaTypeFilter,
  TitleTranslationSource,
} from './plans.enums';
import { MediaMetadataService, DEFAULT_METADATA_SOURCES } from './media-metadata.service';
import { MediaTitleEntity } from './media-title.entity';
import { PlanEntity } from './plan.entity';
import { SimklService } from './simkl.service';
import { buildPosterUrl } from './simkl.utils';
import type { SimklCalendarItem } from './simkl.types';
import type { EnrichmentSourceId } from './title-enrichment.types';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(MediaTitleEntity)
    private readonly calendarRepository: Repository<MediaTitleEntity>,
    @InjectRepository(PlanEntity)
    private readonly plansRepository: Repository<PlanEntity>,
    private readonly simklService: SimklService,
    private readonly animeTranslationService: AnimeTranslationService,
    private readonly mediaMetadataService: MediaMetadataService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailySync(): Promise<void> {
    this.logger.log('Starting daily calendar sync.');
    try {
      const mediaTypes = this.resolveMediaTypes(SimklMediaTypeFilter.All);
      const { bySource, sourceErrors } = await this.syncCalendars(mediaTypes);

      // Priority-queue enrichment: unenriched titles first, then stale (>7 days)
      const { enriched: metadataEnriched, total, coveragePct } =
        await this.mediaMetadataService.enrichNextBatch(500);
      bySource.metadata = metadataEnriched;

      const synced = Object.values(bySource).reduce((sum, count) => sum + count, 0);
      this.logger.log(
        `Daily sync complete: synced=${synced}, bySource=${JSON.stringify(bySource)}`,
      );
      this.logger.log(
        `Metadata enrichment: ${metadataEnriched} enriched this run, coverage=${metadataEnriched}/${total} (${coveragePct.toFixed(1)}%)`,
      );

      if (coveragePct < 50) {
        this.logger.warn(
          `Enrichment coverage is low: ${coveragePct.toFixed(1)}% (${metadataEnriched}/${total}) — run a manual refresh to catch up`,
        );
      }

      if (Object.keys(sourceErrors).length > 0) {
        this.logger.warn(`Source errors: ${JSON.stringify(sourceErrors)}`);
      }

      const translated = await this.animeTranslationService.translateAllMissingTitles();
      this.logger.log(`Daily translation complete: translated=${translated}.`);
    } catch (err) {
      this.logger.error(`Daily sync failed: ${String(err)}`);
    }
  }

  async getCalendar(query: CalendarQueryDto = {}): Promise<CalendarListResponseDto> {
    const mediaTypes = this.resolveMediaTypes(query.source);
    const dateFilter = this.buildDateFilter(query.from, query.to, 'airDate');
    const items = await this.calendarRepository.find({
      where: {
        ...dateFilter,
        mediaType: mediaTypes.length === 1 ? mediaTypes[0] : In(mediaTypes),
      },
      order: { airDate: 'ASC' },
    });

    return {
      items: items.map((item) => this.mapCalendarItem(item)),
      lastSyncedAt: await this.getLastSyncedAt(),
      total: items.length,
    };
  }

  async refreshCalendar(query: CalendarRefreshQueryDto = {}): Promise<CalendarRefreshResponseDto> {
    const mediaTypes = this.resolveRefreshMediaTypes(query);
    const metadataSources = this.resolveMetadataSources(query);
    const shouldTranslate = query.translate !== false;

    this.logger.log(
      `Starting calendar refresh: sources=[${mediaTypes.join(', ')}], metadata=[${metadataSources.join(', ')}], translate=${shouldTranslate}.`,
    );

    const { bySource, sourceErrors } = await this.syncCalendars(mediaTypes);

    if (metadataSources.includes('anihub') && mediaTypes.includes(SimklMediaType.Anime)) {
      try {
        const anihubSeasonal = await this.mediaMetadataService.syncAniHubSeasonal(50);
        bySource.anihub_seasonal = anihubSeasonal;
        this.logger.log(`AniHub seasonal ingest: upserted ${anihubSeasonal} title(s).`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        sourceErrors.anihub_seasonal = message;
        this.logger.error(`AniHub seasonal ingest failed: ${message}`);
      }
    }

    let metadataEnriched = 0;
    if (metadataSources.length > 0 && mediaTypes.includes(SimklMediaType.Anime)) {
      const { enriched, total, coveragePct } = await this.mediaMetadataService.enrichNextBatch(500, metadataSources);
      metadataEnriched = enriched;
      bySource.metadata = metadataEnriched;
      this.logger.log(
        `Metadata merge complete: enriched ${metadataEnriched} anime title(s), coverage=${enriched}/${total} (${coveragePct.toFixed(1)}%)`,
      );
    }

    let translated = 0;
    if (shouldTranslate) {
      this.logger.log('Starting post-sync translation with automatic provider fallback.');
      translated = await this.animeTranslationService.translateAllMissingTitles();
    } else {
      this.logger.log('Post-sync translation skipped for this refresh.');
    }

    const synced = Object.values(bySource).reduce((sum, count) => sum + count, 0);
    this.logger.log(
      `Calendar refresh complete: synced=${synced}, metadata=${metadataEnriched}, translated=${translated}, errors=${Object.keys(sourceErrors).length}.`,
    );

    return {
      synced,
      translated,
      lastSyncedAt: new Date().toISOString(),
      bySource,
      ...(Object.keys(sourceErrors).length > 0 && { sourceErrors }),
    };
  }

  async getUserPlans(userId: string, query: PlansQueryDto = {}): Promise<PlanResponseDto[]> {
    const where: FindOptionsWhere<PlanEntity> = { userId };

    if (query.activityType && query.activityType !== PlanActivityTypeFilter.All) {
      where.activityType = query.activityType as unknown as PlanActivityType;
    }

    if (query.status === PlanStatusFilter.Planned) {
      where.status = PlanStatus.Planned;
    } else if (query.status === PlanStatusFilter.Watched) {
      where.status = PlanStatus.Watched;
    } else if (query.status === PlanStatusFilter.Dropped) {
      where.status = PlanStatus.Dropped;
    }

    Object.assign(where, this.buildDateFilter(query.from, query.to, 'plannedDate'));

    const plans = await this.plansRepository.find({
      where,
      relations: ['calendarItem'],
      order: { plannedDate: 'ASC', createdAt: 'DESC' },
    });

    return plans.map((plan) => this.mapPlan(plan));
  }

  async createPlan(userId: string, dto: CreatePlanDto): Promise<PlanResponseDto> {
    const activityType = dto.activityType ?? PlanActivityType.Watching;

    if (dto.calendarItemId) {
      return this.createWatchingPlan(userId, dto, activityType);
    }

    return this.createActivityPlan(userId, dto, activityType);
  }

  private async createWatchingPlan(
    userId: string,
    dto: CreatePlanDto,
    activityType: PlanActivityType,
  ): Promise<PlanResponseDto> {
    const calendarItem = await this.calendarRepository.findOne({
      where: { id: dto.calendarItemId },
    });

    if (!calendarItem) {
      throw new NotFoundException('Calendar item not found');
    }

    const existing = await this.plansRepository.findOne({
      where: { userId, calendarItemId: calendarItem.id },
      relations: ['calendarItem'],
    });

    if (existing) {
      return this.mapPlan(existing);
    }

    const plan = this.plansRepository.create({
      userId,
      activityType,
      calendarItemId: calendarItem.id,
      title: calendarItem.title,
      posterPath: calendarItem.posterPath,
      plannedDate: calendarItem.airDate,
      notes: dto.notes ?? null,
      status: PlanStatus.Planned,
      sourceUrl: calendarItem.sourceUrl,
      episode: calendarItem.episode,
      metadata: dto.metadata ?? null,
    });

    const saved = await this.plansRepository.save(plan);

    return this.mapPlan({ ...saved, calendarItem });
  }

  private async createActivityPlan(
    userId: string,
    dto: CreatePlanDto,
    activityType: PlanActivityType,
  ): Promise<PlanResponseDto> {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title is required for activity plans without a calendar item.');
    }

    const plan = this.plansRepository.create({
      userId,
      activityType,
      calendarItemId: null,
      title: dto.title.trim(),
      posterPath: null,
      plannedDate: dto.plannedDate ? this.startOfDay(dto.plannedDate) : null,
      notes: dto.notes ?? null,
      status: PlanStatus.Planned,
      sourceUrl: null,
      episode: null,
      metadata: dto.metadata ?? null,
    });

    const saved = await this.plansRepository.save(plan);

    return this.mapPlan(saved);
  }

  async updatePlanStatus(
    userId: string,
    planId: string,
    dto: UpdatePlanStatusDto,
  ): Promise<PlanResponseDto> {
    const plan = await this.plansRepository.findOne({
      where: { id: planId, userId },
      relations: ['calendarItem'],
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    plan.status = dto.status;
    const saved = await this.plansRepository.save(plan);

    return this.mapPlan(saved);
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    const plan = await this.plansRepository.findOne({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.plansRepository.remove(plan);
  }

  private async syncCalendars(
    mediaTypes: SimklMediaType[],
  ): Promise<{ bySource: Record<string, number>; sourceErrors: Record<string, string> }> {
    const syncedAt = new Date();
    const bySource: Record<string, number> = {};
    const sourceErrors: Record<string, string> = {};

    this.logger.log(`Syncing ${mediaTypes.length} source(s): ${mediaTypes.join(', ')}.`);

    for (const mediaType of mediaTypes) {
      try {
        this.logger.log(`Fetching ${mediaType} calendar from Simkl...`);
        const remoteItems = await this.simklService.fetchCalendar(mediaType);
        this.logger.log(`Fetched ${remoteItems.length} ${mediaType} items from Simkl.`);
        let synced = 0;

        for (const remoteItem of remoteItems) {
          try {
            await this.upsertCalendarItem(mediaType, remoteItem, syncedAt);
            synced++;

            if (synced % 50 === 0) {
              this.logger.log(`Upserted ${synced}/${remoteItems.length} ${mediaType} items...`);
            }
          } catch (itemErr) {
            this.logger.warn(
              `Skipped ${mediaType} item ${remoteItem.ids?.simkl_id ?? 'unknown'}: ${String(itemErr)}`,
            );
          }
        }

        bySource[mediaType] = synced;
        this.logger.log(`Finished ${mediaType} sync: upserted ${synced}/${remoteItems.length} items.`);
      } catch (sourceErr) {
        const message = sourceErr instanceof Error ? sourceErr.message : String(sourceErr);
        this.logger.error(`Sync failed for source "${mediaType}": ${message}`);
        bySource[mediaType] = 0;
        sourceErrors[mediaType] = message;
      }
    }

    return { bySource, sourceErrors };
  }

  private async upsertCalendarItem(
    mediaType: SimklMediaType,
    remoteItem: SimklCalendarItem,
    syncedAt: Date,
  ): Promise<void> {
    const simklId = remoteItem.ids?.simkl_id;

    if (!simklId) {
      this.logger.debug(`Skipping ${mediaType} item without simklId: "${remoteItem.title}".`);
      return;
    }

    const override = getTitleOverride(simklId, remoteItem.ids.slug);
    let titleEn: string | null = override?.titleEn ?? null;
    let titleUa: string | null = override?.titleUa ?? null;
    let titleTranslationSource: TitleTranslationSource | null = override
      ? TitleTranslationSource.Manual
      : null;
    let genres: string[] | null = null;

    const existing = await this.calendarRepository.findOne({
      where: { simklId, mediaType },
    });

    // Prefer genres already in the Simkl response; fall back to existing DB value.
    genres = remoteItem.genres?.length ? remoteItem.genres : (existing?.genres ?? null);

    if (!titleEn && mediaType !== SimklMediaType.Anime) {
      titleEn = remoteItem.title;
    }

    const payload: Partial<MediaTitleEntity> = {
      mediaType,
      simklId,
      malId: remoteItem.ids?.mal ?? existing?.malId ?? null,
      slug: remoteItem.ids.slug,
      title: remoteItem.title,
      titleEn: titleEn ?? existing?.titleEn ?? null,
      titleUa: titleUa ?? existing?.titleUa ?? null,
      titleOriginal: existing?.titleOriginal ?? null,
      titleTranslationSource:
        titleUa && override
          ? TitleTranslationSource.Manual
          : titleTranslationSource ?? existing?.titleTranslationSource ?? null,
      titleTranslatedAt:
        titleUa && override ? new Date() : existing?.titleTranslatedAt ?? null,
      airDate: new Date(remoteItem.date),
      releaseDate: remoteItem.release_date ?? null,
      posterPath: remoteItem.poster,
      sourceUrl: remoteItem.url,
      rank: remoteItem.rank ?? null,
      ratings: remoteItem.ratings ?? null,
      ids: remoteItem.ids,
      episode: remoteItem.episode ?? null,
      genres,
      syncedAt,
    };

    if (existing) {
      await this.calendarRepository.save({ ...existing, ...payload });
      return;
    }

    await this.calendarRepository.save(this.calendarRepository.create(payload));
  }

  private resolveMetadataSources(query: CalendarRefreshQueryDto): EnrichmentSourceId[] {
    if (query.metadataSources?.length) {
      return query.metadataSources;
    }

    if (query.metadata === false) {
      return [];
    }

    return DEFAULT_METADATA_SOURCES;
  }

  private resolveRefreshMediaTypes(query: CalendarRefreshQueryDto): SimklMediaType[] {
    if (query.sources?.length) {
      return query.sources;
    }

    return this.resolveMediaTypes(query.source ?? SimklMediaTypeFilter.All);
  }

  private resolveMediaTypes(source?: SimklMediaTypeFilter): SimklMediaType[] {
    if (source === SimklMediaTypeFilter.Anime) {
      return [SimklMediaType.Anime];
    }
    if (source === SimklMediaTypeFilter.Tv) {
      return [SimklMediaType.Tv];
    }
    if (source === SimklMediaTypeFilter.Movie) {
      return [SimklMediaType.Movie];
    }

    return Object.values(SimklMediaType);
  }

  private buildDateFilter(
    from: string | undefined,
    to: string | undefined,
    field: 'airDate' | 'plannedDate',
  ): FindOptionsWhere<MediaTitleEntity> | FindOptionsWhere<PlanEntity> {
    if (from && to) {
      return {
        [field]: Between(this.startOfDay(from), this.endOfDay(to)),
      } as FindOptionsWhere<MediaTitleEntity>;
    }

    if (from) {
      return {
        [field]: MoreThanOrEqual(this.startOfDay(from)),
      } as FindOptionsWhere<MediaTitleEntity>;
    }

    if (to) {
      return {
        [field]: LessThanOrEqual(this.endOfDay(to)),
      } as FindOptionsWhere<MediaTitleEntity>;
    }

    return {};
  }

  private startOfDay(date: string): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: string): Date {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
  }

  private async getLastSyncedAt(): Promise<string | null> {
    const [latest] = await this.calendarRepository.find({
      order: { syncedAt: 'DESC' },
      take: 1,
    });

    return latest?.syncedAt.toISOString() ?? null;
  }

  private mapCalendarItem(item: MediaTitleEntity): CalendarItemResponseDto {
    return {
      id: item.id,
      mediaType: item.mediaType,
      simklId: item.simklId,
      malId: item.malId,
      anilistId: item.anilistId ?? null,
      slug: item.slug,
      title: item.title,
      titleEn: item.titleEn,
      titleUa: item.titleUa,
      titleOriginal: item.titleOriginal,
      titleTranslationSource: item.titleTranslationSource,
      airDate: item.airDate.toISOString(),
      releaseDate: item.releaseDate,
      posterUrl: buildPosterUrl(item.posterPath),
      sourceUrl: item.sourceUrl,
      rank: item.rank,
      ratings: item.ratings,
      mergedRatings: item.mergedRatings,
      ids: item.ids,
      episode: item.episode,
      genres: item.genres,
      description: item.description,
      year: item.year,
      airingStatus: item.airingStatus,
      episodes: item.episodes,
      hasUkrainianDub: item.hasUkrainianDub,
      nextEpisodeAiringAt: item.nextEpisodeAiringAt?.toISOString() ?? null,
      syncedAt: item.syncedAt.toISOString(),
      enrichedAt: item.enrichedAt?.toISOString() ?? null,
    };
  }

  private mapPlan(plan: PlanEntity): PlanResponseDto {
    const calendarItem = plan.calendarItem;

    return {
      id: plan.id,
      activityType: plan.activityType,
      title: plan.title,
      titleEn: calendarItem?.titleEn ?? null,
      titleUa: calendarItem?.titleUa ?? null,
      posterUrl: buildPosterUrl(plan.posterPath),
      plannedDate: plan.plannedDate?.toISOString() ?? null,
      notes: plan.notes,
      status: plan.status,
      sourceUrl: plan.sourceUrl,
      mediaType: calendarItem?.mediaType ?? null,
      episode: plan.episode,
      calendarItemId: plan.calendarItemId,
      metadata: plan.metadata,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}
