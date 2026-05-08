import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateSetBuilder, type SetBuilderItem } from "@/lib/set-builder";

const schema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive()
    })
  )
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const ids = body.data.items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      isAvailable: true,
      isSetBuilderEnabled: true,
      category: { slug: { notIn: ["sets", "drinks"] } },
      NOT: [
        { name: { contains: "соус", mode: "insensitive" } },
        { name: { contains: "халапеньо", mode: "insensitive" } }
      ]
    }
  });
  const rule = await prisma.setBuilderRule.findFirst({ where: { isActive: true } });

  if (!rule) {
    return NextResponse.json({ error: "Правило конструктора не настроено" }, { status: 400 });
  }

  const items: SetBuilderItem[] = [];

  for (const input of body.data.items) {
    const menuItem = menuItems.find((item) => item.id === input.menuItemId);
    if (!menuItem) {
      return NextResponse.json({ error: "Недоступная позиция меню" }, { status: 400 });
    }

    items.push({
      id: menuItem.id,
      name: menuItem.name,
      quantity: input.quantity,
      sellingPrice: menuItem.sellingPrice,
      costPrice: menuItem.costPrice,
      setBuilderPrice: menuItem.setBuilderPrice
    });
  }

  const result = calculateSetBuilder(items, rule);

  return NextResponse.json({
    total: result.finalTotal,
    normalTotal: result.normalTotal,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    mode: result.isCustomSet ? "custom_set" : "regular"
  });
}
