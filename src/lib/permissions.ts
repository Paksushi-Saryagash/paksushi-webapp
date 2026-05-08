import { UserRole } from "@prisma/client";

export function canManageUsers(role: UserRole) {
  return role === "OWNER";
}

export function canViewAuditLog(role: UserRole) {
  return role === "OWNER";
}

export function canCancelOrders(role: UserRole) {
  return role === "OWNER";
}

export function canManageSetRules(role: UserRole) {
  return role === "OWNER";
}
