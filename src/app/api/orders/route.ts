import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateOrderTotals, type SetBuilderItem } from "@/lib/set-builder";
import { audit } from "@/lib/audit";
import { getOpenShift } from "@/lib/shift";

const createOrderSchema = z.object({
  source: z.nativeEnum(OrderSource).default("WHATSAPP"),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

export async function GET() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      items: true
    },
    take: 100
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = createOrderSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  if (user.role === "OPERATOR") {
    const shift = await getOpenShift(user.id);
    if (!shift) {
      return NextResponse.json({ error: "Сначала откройте смену" }, { status: 403 });
    }
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: body.data.items.map((item) => item.menuItemId) },
      isActive: true,
      isAvailable: true
    }
  });
  const rule = await prisma.setBuilderRule.findFirst({ where: { isActive: true } });

  if (!rule) {
    return NextResponse.json({ error: "Правило конструктора не настроено" }, { status: 400 });
  }

  const orderItems: SetBuilderItem[] = [];

  for (const input of body.data.items) {
    const item = menuItems.find((menuItem) => menuItem.id === input.menuItemId);
    if (!item) {
      return NextResponse.json({ error: "Позиция меню не найдена" }, { status: 400 });
    }

    orderItems.push({
      id: item.id,
      name: item.name,
      quantity: input.quantity,
      sellingPrice: item.sellingPrice,
      costPrice: item.costPrice,
      setBuilderPrice: item.setBuilderPrice
    });
  }

  const totals = calculateOrderTotals(orderItems, rule);

  const order = await prisma.order.create({
    data: {
      source: body.data.source,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      customerName: body.data.customerName,
      customerPhone: body.data.customerPhone,
      customerAddress: body.data.customerAddress,
      comment: body.data.comment,
      type: totals.type,
      subtotal: totals.normalTotal,
      totalRevenue: totals.finalTotal,
      totalCost: totals.costTotal,
      totalProfit: totals.profitTotal,
      createdById: user.id,
      items: {
        create: totals.lines
      }
    },
    include: { items: true }
  });

  await audit({
    actorId: user.id,
    action: "CREATE_ORDER",
    entityType: "order",
    entityId: order.id,
    details: { orderNumber: order.orderNumber, totalRevenue: order.totalRevenue }
  });

  return NextResponse.json({ order }, { status: 201 });
}
