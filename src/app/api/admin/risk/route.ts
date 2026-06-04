import { AccountStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET() {
  const [frozenUsers, restrictedUsers, largeWithdrawals, abnormalOrders] = await Promise.all([
    prisma.user.findMany({ where: { accountStatus: AccountStatus.FROZEN }, select: { id: true, uid: true, email: true, riskLevel: true, accountStatus: true, withdrawalRestricted: true }, take: 100 }),
    prisma.user.findMany({ where: { withdrawalRestricted: true }, select: { id: true, uid: true, email: true, riskLevel: true, accountStatus: true, withdrawalRestricted: true }, take: 100 }),
    prisma.withdrawalRequest.findMany({ where: { amount: { gte: 10000 } }, include: { user: { select: { email: true, uid: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.order.findMany({ where: { status: { in: [OrderStatus.REJECTED, OrderStatus.CANCELED] } }, include: { user: { select: { email: true, uid: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
  ]);
  return platformJson({ frozenUsers, restrictedUsers, largeWithdrawals, frequentLoginUsers: [], abnormalOrders });
}
