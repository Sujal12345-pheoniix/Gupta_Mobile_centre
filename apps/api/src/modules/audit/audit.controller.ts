import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditService, AuditAction } from './audit.service';
import { AuthUser } from '../auth/auth.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RequirePermissions('audit.view')
  async getAuditLogs(
    @CurrentUser() user: AuthUser,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const data = await this.auditService.getAuditLogs({
      organizationId: user.organizationId,
      entityType,
      entityId,
      actorId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return { success: true, ...data };
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('audit.view')
  async getEntityHistory(
    @CurrentUser() user: AuthUser,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const data = await this.auditService.getEntityHistory(
      user.organizationId,
      entityType,
      entityId,
    );

    return { success: true, data };
  }

  @Get('actor/:actorId')
  @RequirePermissions('audit.view')
  async getActorActivity(
    @CurrentUser() user: AuthUser,
    @Param('actorId') actorId: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.auditService.getActorActivity(
      user.organizationId,
      actorId,
      limit ? parseInt(limit, 10) : undefined,
    );

    return { success: true, data };
  }
}
