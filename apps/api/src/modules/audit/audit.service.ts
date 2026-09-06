import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'TRANSFER';

export interface AuditLogInput {
  organizationId: string;
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    const { organizationId, actorId, action, entityType, entityId, beforeData, afterData, metadata } = input;

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorId: actorId || null,
        action,
        entityType,
        entityId: entityId || null,
        beforeData: beforeData || null,
        afterData: afterData || null,
        metadata: metadata || null,
      },
    });
  }

  async logBatch(inputs: AuditLogInput[]): Promise<void> {
    await this.prisma.auditLog.createMany({
      data: inputs.map((input) => ({
        organizationId: input.organizationId,
        actorId: input.actorId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        beforeData: input.beforeData || null,
        afterData: input.afterData || null,
        metadata: input.metadata || null,
      })),
    });
  }

  async getAuditLogs(options: {
    organizationId: string;
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const {
      organizationId,
      entityType,
      entityId,
      actorId,
      action,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    const where: any = { organizationId };

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    };
  }

  async getEntityHistory(
    organizationId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        entityType,
        entityId,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActorActivity(
    organizationId: string,
    actorId: string,
    limit = 50,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        actorId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
