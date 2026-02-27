import { Prisma } from "@prisma/client";
import { db } from "./db";

export interface AuditLogInput {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "ROLE_CHANGE" | "VERIFY" | "UNVERIFY";
  entityType: string;
  entityId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  changes?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event to the database
 * Use this for all sensitive operations: role changes, deletions, creations, updates
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues,
        newValues: input.newValues,
        changes: input.changes,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging failure shouldn't break the application
  }
}

/**
 * Helper to extract changes between old and new values
 * Returns a human-readable summary of what changed
 */
export function summarizeChanges(
  oldValues: Record<string, unknown> | undefined,
  newValues: Record<string, unknown> | undefined,
  action: string
): string {
  if (action === "CREATE") {
    return `Created new ${Object.keys(newValues || {}).join(", ")}`;
  }

  if (action === "DELETE") {
    return `Deleted ${Object.keys(oldValues || {}).join(", ")}`;
  }

  if (action === "RESTORE") {
    return "Restored archived record";
  }

  const changedFields: string[] = [];
  if (oldValues && newValues) {
    Object.keys(newValues).forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(`${key}: ${oldValues[key]} → ${newValues[key]}`);
      }
    });
  }

  return changedFields.length > 0
    ? `Changed ${changedFields.join(", ")}`
    : "Updated record";
}

/**
 * Get audit logs for a specific entity
 * Useful for compliance and security investigations
 */
export async function getEntityAuditLog(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return await db.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      action: true,
      oldValues: true,
      newValues: true,
      changes: true,
      createdAt: true,
    },
  });
}

/**
 * Get audit logs for a specific user (what actions did they perform)
 */
export async function getUserAuditLog(
  userId: string,
  limit: number = 50
) {
  return await db.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      changes: true,
      createdAt: true,
    },
  });
}

/**
 * Get all audit logs for admin review
 * Supports filtering by action and date range
 */
export async function getAuditLogs({
  action,
  startDate,
  endDate,
  limit = 100,
  skip = 0,
}: {
  action?: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "ROLE_CHANGE" | "VERIFY" | "UNVERIFY";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
} = {}) {
  return await db.auditLog.findMany({
    where: {
      ...(action && { action }),
      ...(startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
    select: {
      id: true,
      userId: true,
      action: true,
      entityType: true,
      entityId: true,
      changes: true,
      ipAddress: true,
      createdAt: true,
    },
  });
}
