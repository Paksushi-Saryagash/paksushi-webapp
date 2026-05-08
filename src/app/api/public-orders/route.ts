import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculatePublicOrder } from "@/lib/order-totals";
import type { SetBuilderItem } from "@/lib/set-builder";

const publicOrderSchema = z.object({
  customerName: z.string().min(1).max(80),
  orderType: z.enum(["REGULAR", "CUSTOM_SET"]).default("REGULAR"),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

export async function POST(request: Request) {
  const body = publicOrderSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Введите имя и выберите позиции" }, { status: 400 });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: body.data.items.map((item) => item.menuItemId) },
      isActive: true,
      isAvailable: true,
      ...(body.data.orderType === "CUSTOM_SET" ? { isSetBuilderEnabled: true } : {})
    }
  });
  const rule = await prisma.setBuilderRule.findFirst({ where: { isActive: true } });
  const systemUser = await prisma.user.findFirst({
    where: { isActive: true, role: "OWNER" },
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  if (!rule) {
    return NextResponse.json({ error: "Правило конструктора не настроено" }, { status: 400 });
  }

  if (!systemUser) {
    return NextResponse.json({ error: "Администратор для приема заявок не найден" }, { status: 400 });
  }

  const orderItems: SetBuilderItem[] = [];

  for (const input of body.data.items) {
    const item = menuItems.find((menuItem) => menuItem.id === input.menuItemId);
    if (!item) {
      return NextResponse.json({ error: "Позиция меню недоступна" }, { status: 400 });
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

  const totals = calculatePublicOrder(orderItems, rule, body.data.orderType);

  const order = await prisma.order.create({
    data: {
      source: "WHATSAPP",
      status: "NEW",
      paymentStatus: "UNPAID",
      customerName: body.data.customerName,
      comment: body.data.orderType === "CUSTOM_SET" ? "Заявка с сайта: Собери сет" : "Заявка с сайта",
      type: totals.type,
      subtotal: totals.normalTotal,
      totalRevenue: totals.finalTotal,
      totalCost: totals.costTotal,
      totalProfit: totals.profitTotal,
      createdById: systemUser.id,
      items: {
        create: totals.lines
      }
    },
    include: { items: true }
  });

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      totalRevenue: order.totalRevenue
    }
  }, { status: 201 });
}
