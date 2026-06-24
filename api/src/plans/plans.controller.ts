import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesEnum } from '../users/interfaces/roles.enum';
import { UsersEntity } from '../users/users.entity';
import { CurrentUser } from '../users/utils/current-user';
import { CalendarQueryDto, CalendarRefreshQueryDto } from './dto/calendar-query.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlansQueryDto } from './dto/plans-query.dto';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';
import {
  CalendarListResponseDto,
  CalendarRefreshResponseDto,
  PlanResponseDto,
} from './dto/responses/plans-response.dto';
import { RecommendationsResponseDto } from './dto/responses/recommendations-response.dto';
import { TitleDetailQueryDto } from './dto/title-detail-query.dto';
import { TitleDetailResponseDto } from './dto/responses/title-detail-response.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';
import { PlansService } from './plans.service';
import { RecommendationsService } from './recommendations.service';
import { TitleEnrichmentService } from './title-enrichment.service';

@ApiTags('plans')
@Controller('plans')
@ApiBearerAuth()
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  @Inject(PlansService) plansService: PlansService;
  @Inject(RecommendationsService) recommendationsService: RecommendationsService;
  @Inject(TitleEnrichmentService) titleEnrichmentService: TitleEnrichmentService;

  @Get('calendar')
  @Roles(RolesEnum.Any)
  @ApiOperation({
    summary: 'List cached media titles',
    description: 'Returns merged anime, TV, and movie releases from the unified media_titles table.',
  })
  @ApiOkResponse({ type: CalendarListResponseDto })
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.plansService.getCalendar(query);
  }

  @Post('calendar/refresh')
  @Roles(RolesEnum.Admin)
  @ApiOperation({
    summary: 'Refresh media title catalog',
    description:
      'Admin only. Fetches calendar feeds and merges anime metadata from all enabled sources into media_titles.',
  })
  @ApiOkResponse({ type: CalendarRefreshResponseDto })
  refreshCalendar(@Query() query: CalendarRefreshQueryDto) {
    this.logger.log(
      `Calendar refresh requested: sources=${query.sources?.join(',') ?? query.source ?? 'all'}, translate=${query.translate ?? true}.`,
    );
    return this.plansService.refreshCalendar(query);
  }

  @Get('calendar/:id')
  @Roles(RolesEnum.Any)
  @ApiOperation({
    summary: 'Get title detail with expanded metadata',
    description:
      'Returns merged title data from media_titles and refreshes metadata from enabled sources.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TitleDetailResponseDto })
  getCalendarItemDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: TitleDetailQueryDto,
  ) {
    return this.titleEnrichmentService.getTitleDetail(id, query.sources);
  }

  @Get('recommendations')
  @Roles(RolesEnum.Any)
  @ApiOperation({
    summary: 'Get activity recommendations and ideas',
    description:
      'Returns curated idea cards per activity. Watching uses merged ratings and metadata from media_titles.',
  })
  @ApiOkResponse({ type: RecommendationsResponseDto })
  getRecommendations(@Query() query: RecommendationsQueryDto) {
    return this.recommendationsService.getRecommendations(query.activity);
  }

  @Get()
  @Roles(RolesEnum.Any)
  @ApiOperation({ summary: 'List saved plans for the current user' })
  @ApiOkResponse({ type: PlanResponseDto, isArray: true })
  getUserPlans(@CurrentUser() user: UsersEntity, @Query() query: PlansQueryDto) {
    return this.plansService.getUserPlans(user.id, query);
  }

  @Post()
  @Roles(RolesEnum.Any)
  @ApiOperation({ summary: 'Create a plan (watching or activity)' })
  @ApiOkResponse({ type: PlanResponseDto })
  createPlan(@CurrentUser() user: UsersEntity, @Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(user.id, dto);
  }

  @Patch(':id/status')
  @Roles(RolesEnum.Any)
  @ApiOperation({ summary: 'Update status for a saved plan' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PlanResponseDto })
  updatePlanStatus(
    @CurrentUser() user: UsersEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanStatusDto,
  ) {
    return this.plansService.updatePlanStatus(user.id, id, dto);
  }

  @Delete(':id')
  @Roles(RolesEnum.Any)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved plan' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Plan removed successfully.' })
  deletePlan(
    @CurrentUser() user: UsersEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.plansService.deletePlan(user.id, id);
  }
}
