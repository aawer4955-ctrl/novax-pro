import { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminPermission =
  | "user.read"
  | "user.update"
  | "user.freeze"
  | "balance.read"
  | "balance.adjust"
  | "deposit.read"
  | "deposit.review"
  | "deposit.address.assign"
  | "withdrawal.read"
  | "withdrawal.review"
  | "withdrawal.restrict"
  | "order.read"
  | "order.cancel"
  | "market.read"
  | "market.update"
  | "audit.read"
  | "risk.read"
  | "risk.update"
  | "settings.read"
  | "settings.update"
  | "admin.manage";

const rolePermissions: Record<UserRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "user.read",
    "user.update",
    "user.freeze",
    "balance.read",
    "balance.adjust",
    "deposit.read",
    "deposit.review",
    "deposit.address.assign",
    "withdrawal.read",
    "withdrawal.review",
    "withdrawal.restrict",
    "order.read",
    "order.cancel",
    "market.read",
    "market.update",
    "audit.read",
    "risk.read",
    "risk.update",
    "settings.read",
    "settings.update",
    "admin.manage",
  ],
  ADMIN: [
    "user.read",
    "user.update",
    "deposit.read",
    "deposit.address.assign",
    "withdrawal.read",
    "order.read",
    "market.read",
    "audit.read",
  ],
  FINANCE_MANAGER: [
    "balance.read",
    "balance.adjust",
    "deposit.read",
    "deposit.review",
    "withdrawal.read",
    "withdrawal.review",
    "audit.read",
  ],
  RISK_MANAGER: [
    "user.read",
    "user.freeze",
    "balance.read",
    "withdrawal.read",
    "withdrawal.restrict",
    "order.read",
    "order.cancel",
    "audit.read",
    "risk.read",
    "risk.update",
  ],
  SUPPORT: ["user.read", "deposit.read", "deposit.address.assign", "withdrawal.read", "order.read"],
  AUDITOR: ["user.read", "balance.read", "deposit.read", "withdrawal.read", "order.read", "market.read", "audit.read", "risk.read", "settings.read"],
  USER: [],
};

export const ADMIN_ROLE_PERMISSIONS = rolePermissions;

export function hasPermission(role: UserRole | string | null | undefined, permission: AdminPermission) {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase() as UserRole;
  return Boolean(rolePermissions[normalizedRole]?.includes(permission));
}

export function requireAdminPermission(user: Pick<User, "role" | "accountStatus"> | null | undefined, permission: AdminPermission) {
  if (!user) throw new Error("Admin authentication is required.");
  if (user.accountStatus !== "ACTIVE") throw new Error("Admin account is not active.");
  if (!hasPermission(user.role, permission)) throw new Error(`Admin permission required: ${permission}`);
}

export async function requireAdminFromRequest(request: Request, permission: AdminPermission, adminId?: string) {
  const headerAdminId = request.headers.get("x-admin-id") ?? request.headers.get("x-novax-admin-id");
  const resolvedAdminId = String(adminId || headerAdminId || "").trim();
  if (!resolvedAdminId) throw new Error("adminId is required for admin operations.");

  const admin = await prisma.user.findUnique({ where: { id: resolvedAdminId } });
  if (!admin) throw new Error("Admin account not found.");
  requireAdminPermission(admin, permission);
  return admin;
}
