import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { ACTIVITY_IDEAS, mapIdeasToCards } from './activity-ideas.catalog';
import type {
  IdeaCardDto,
  RecommendationsResponseDto,
  RecommendationSectionDto,
} from './dto/responses/recommendations-response.dto';
import { PlanActivityType } from './plans.enums';
import { MediaTitleEntity } from './media-title.entity';
import { buildPosterUrl } from './simkl.utils';
import type { SimklRatings } from './simkl.types';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(MediaTitleEntity)
    private readonly mediaTitleRepository: Repository<MediaTitleEntity>,
  ) {}

  async getRecommendations(activity: PlanActivityType): Promise<RecommendationsResponseDto> {
    if (activity === PlanActivityType.Watching) {
      return {
        activity,
        sections: await this.getWatchingRecommendations(),
      };
    }

    const ideas = ACTIVITY_IDEAS[activity] ?? [];

    return {
      activity,
      sections: [
        {
          section: 'ideas',
          title: 'Ideas for you',
          items: mapIdeasToCards(ideas),
        },
      ],
    };
  }

  private async getWatchingRecommendations(): Promise<RecommendationSectionDto[]> {
    const [trending, topRated] = await Promise.all([
      this.mediaTitleRepository.find({
        where: { rank: Not(IsNull()) },
        order: { rank: 'ASC' },
        take: 12,
      }),
      this.mediaTitleRepository.find({
        take: 80,
      }),
    ]);

    const topRatedSorted = topRated
      .map((item) => ({ item, score: this.getBestRating(item) }))
      .filter((entry) => entry.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 12)
      .map((entry) => entry.item);

    const sections: RecommendationSectionDto[] = [];

    if (trending.length > 0) {
      sections.push({
        section: 'trending',
        title: 'Trending this season',
        items: trending.map((item) => this.mapCalendarToIdeaCard(item, 'trending')),
      });
    }

    if (topRatedSorted.length > 0) {
      sections.push({
        section: 'top-rated',
        title: 'Top rated',
        items: topRatedSorted.map((item) => this.mapCalendarToIdeaCard(item, 'top-rated')),
      });
    }

    return sections;
  }

  private mapCalendarToIdeaCard(
    item: MediaTitleEntity,
    tag: 'trending' | 'top-rated' | null = null,
  ): IdeaCardDto {
    return {
      id: item.id,
      title: item.titleEn ?? item.titleUa ?? item.title,
      emoji: item.mediaType === 'anime' ? '🎌' : item.mediaType === 'tv' ? '📺' : '🎬',
      vibe: item.mediaType,
      groupSize: null,
      summary: item.description ?? item.titleUa ?? item.titleEn ?? item.title,
      howItWorks: null,
      homekitTieIn: null,
      posterUrl: buildPosterUrl(item.posterPath),
      rank: item.rank,
      rating: this.getBestRating(item),
      tag,
    };
  }

  private getBestRating(item: MediaTitleEntity): number | null {
    const merged = item.mergedRatings;
    if (merged) {
      return (
        merged.mal ??
        merged.shikimori ??
        merged.yani ??
        merged.simkl ??
        merged.imdb ??
        null
      );
    }

    return this.getSimklRatingsScore(item.ratings);
  }

  private getSimklRatingsScore(ratings: SimklRatings | null): number | null {
    if (!ratings) {
      return null;
    }

    return ratings.mal?.rating ?? ratings.simkl?.rating ?? ratings.imdb?.rating ?? null;
  }
}
