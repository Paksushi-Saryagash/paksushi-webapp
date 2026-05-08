import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const confirmedStatuses: OrderStatus[] = ["CONFIRMED", "COOKING", "READY", "COMPLETED"];

export async function GET() {
  await requireOwner();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, month, popularItems] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfDay }, status: { in: confirmedStatuses } },
      _sum: { totalRevenue: true, totalCost: true, totalProfit: true },
      _count: true,
      _avg: { totalRevenue: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { in: confirmedStatuses } },
      _sum: { totalRevenue: true, totalCost: true, totalProfit: true },
      _count: true,
      _avg: { totalRevenue: true }
    }),
    prisma.orderItem.groupBy({
      by: ["nameSnapshot"],
      where: { order: { status: { in: confirmedStatuses } } },
      _sum: { quantity: true, lineRevenue: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8
    })
  ]);

  return NextResponse.json({
    today,
    month,
    popularItems
  });
}
