import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const menuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().optional().nullable(),
  sellingPrice: z.number().int().nonnegative().optional(),
  costPrice: z.number().int().nonnegative().optional(),
  setBuilderPrice: z.number().int().nonnegative().optional(),
  weight: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSetBuilderEnabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireOwner();
  const body = menuItemSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: body.data
  });

  await audit({
    actorId: user.id,
    action: "UPDATE_MENU_ITEM",
    entityType: "menuItem",
    entityId: item.id,
    details: body.data
  });

  return NextResponse.json({ item });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await requireOwner();

  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      isActive: false,
      isAvailable: false,
      isSetBuilderEnabled: false
    }
  });

  await audit({
    actorId: user.id,
    action: "DELETE_MENU_ITEM",
    entityType: "menuItem",
    entityId: item.id,
    details: { name: item.name, softDelete: true }
  });

  return NextResponse.json({ ok: true });
}
