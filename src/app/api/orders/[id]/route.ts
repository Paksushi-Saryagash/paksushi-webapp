import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getOpenShift } from "@/lib/shift";

const updateSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  cancelReason: z.string().optional().nullable(),
  refundReason: z.string().optional().nullable()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: true,
      createdBy: { select: { name: true, role: true } }
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const body = updateSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const current = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, comment: true, paymentStatus: true, totalRevenue: true }
  });

  if (!current) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const isPublicLead =
    current.status === "NEW" &&
    (current.comment?.startsWith("Заявка с сайта") ?? false);
  const isRejectingLead = isPublicLead && body.data.status === "CANCELLED";
  const isAcceptingLead = isPublicLead && body.data.status === "CONFIRMED";
  const isRefund = body.data.paymentStatus === "REFUNDED";

  if (user.role === "OPERATOR" && (isAcceptingLead || isRefund)) {
    const shift = await getOpenShift(user.id);
    if (!shift) {
      return NextResponse.json({ error: "Сначала откройте смену" }, { status: 403 });
    }
  }

  if (body.data.status === "CANCELLED" && !isRejectingLead && !isRefund && user.role !== "OWNER") {
    return NextResponse.json({ error: "Оператор может отклонять только новые заявки. Для принятого заказа используйте возврат." }, { status: 403 });
  }

  const auditReason = body.data.refundReason || body.data.cancelReason || (isRefund ? "Возврат по заказу" : undefined);
  const data = isRefund
    ? {
        status: "CANCELLED" as OrderStatus,
        paymentStatus: "REFUNDED" as PaymentStatus,
        cancelReason: auditReason
      }
    : isAcceptingLead
      ? {
          status: "CONFIRMED" as OrderStatus,
          paymentStatus: "PAID" as PaymentStatus,
          createdById: user.id
        }
      : body.data;

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: params.id },
      data
    });

    if (data.paymentStatus === "PAID") {
      const existingPayment = await tx.payment.findFirst({ where: { orderId: updated.id } });
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            orderId: updated.id,
            amount: updated.totalRevenue
          }
        });
      }
    }

    return updated;
  });

  const action =
    isRefund
      ? "REFUND_ORDER"
      : isRejectingLead
        ? "CANCEL_ORDER"
        : isAcceptingLead
          ? "CREATE_ORDER"
          : "UPDATE_ORDER";

  await audit({
    actorId: user.id,
    action,
    entityType: "order",
    entityId: order.id,
    details: {
      orderNumber: order.orderNumber,
      totalRevenue: order.totalRevenue,
      reason: auditReason,
      publicLeadAction: isPublicLead ? data.status : undefined
    }
  });

  return NextResponse.json({ order });
}
