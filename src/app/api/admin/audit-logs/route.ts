import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const adminId = new URL(request.url).searchParams.get("adminId");
  const auditLogs = await prisma.auditLog.findMany({
    where: adminId ? { adminId } : undefined,
    include: { admin: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
  });

  return platformJson({ auditLogs });
}
