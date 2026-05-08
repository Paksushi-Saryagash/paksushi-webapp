import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function audit(params: {
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details
    }
  });
}
