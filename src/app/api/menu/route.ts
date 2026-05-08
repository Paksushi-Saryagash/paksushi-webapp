import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  sellingPrice: z.number().int().nonnegative(),
  costPrice: z.number().int().nonnegative(),
  setBuilderPrice: z.number().int().nonnegative(),
  weight: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isSetBuilderEnabled: z.boolean().default(false)
});

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          sellingPrice: true,
          weight: true,
          ingredients: true,
          isAvailable: true,
          isSetBuilderEnabled: true
        }
      }
    }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const user = await requireOwner();
  const body = menuItemSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({ data: body.data });
  await audit({
    actorId: user.id,
    action: "CREATE_MENU_ITEM",
    entityType: "menuItem",
    entityId: item.id,
    details: { name: item.name }
  });

  return NextResponse.json({ item }, { status: 201 });
}
