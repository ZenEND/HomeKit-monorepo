import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { AniHubService } from './anihub.service';
import { AniListService } from './anilist.service';
import { AnimeTranslationService } from './anime-translation.service';
import { JikanService } from './jikan.service';
import { MediaMetadataService } from './media-metadata.service';
import { MediaTitleEntity } from './media-title.entity';
import { ShikimoriService } from './shikimori.service';
import { TitleEnrichmentService } from './title-enrichment.service';
import { TitleMergeService } from './title-merge.service';
import { YaniService } from './yani.service';
import { PlanEntity } from './plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { RecommendationsService } from './recommendations.service';
import { SimklService } from './simkl.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaTitleEntity, PlanEntity]), AiModule],
  controllers: [PlansController],
  providers: [
    PlansService,
    SimklService,
    JikanService,
    AniHubService,
    AniListService,
    ShikimoriService,
    YaniService,
    TitleMergeService,
    MediaMetadataService,
    TitleEnrichmentService,
    AnimeTranslationService,
    RecommendationsService,
  ],
})
export class PlansModule {}
