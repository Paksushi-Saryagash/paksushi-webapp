import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

export async function GET() {
  await requireOwner();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { name: true, login: true, role: true } }
    },
    take: 200
  });

  return NextResponse.json({ logs });
}
