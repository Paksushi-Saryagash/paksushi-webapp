import { prisma } from "@/lib/prisma";

export async function getOpenShift(operatorId: string) {
  return prisma.shift.findFirst({
    where: { operatorId, isOpen: true },
    orderBy: { openedAt: "desc" }
  });
}

export async function summarizeShift(shiftId: string) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift) return null;

  const orders = await prisma.order.findMany({
    where: {
      createdById: shift.operatorId,
      createdAt: {
        gte: shift.openedAt,
        lte: shift.closedAt ?? new Date()
      }
    },
    select: {
      status: true,
      paymentStatus: true,
      totalRevenue: true
    }
  });

  const acceptedOrders = orders.filter((order) => order.status === "CONFIRMED" && order.paymentStatus !== "REFUNDED");
  const refundedOrders = orders.filter((order) => order.paymentStatus === "REFUNDED");

  return {
    orderCount: acceptedOrders.length,
    revenueTotal: acceptedOrders.reduce((total, order) => total + order.totalRevenue, 0),
    refundTotal: refundedOrders.reduce((total, order) => total + order.totalRevenue, 0)
  };
}
