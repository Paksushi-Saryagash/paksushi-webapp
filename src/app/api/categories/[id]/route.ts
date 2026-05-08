import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const body = schema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const category = await prisma.menuCategory.update({
    where: { id: params.id },
    data: body.data
  });

  await audit({
    actorId: owner.id,
    action: "UPDATE_CATEGORY",
    entityType: "menuCategory",
    entityId: category.id,
    details: body.data
  });

  return NextResponse.json({ category });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();

  const category = await prisma.menuCategory.update({
    where: { id: params.id },
    data: {
      isActive: false,
      items: {
        updateMany: {
          where: { isActive: true },
          data: {
            isActive: false,
            isAvailable: false,
            isSetBuilderEnabled: false
          }
        }
      }
    }
  });

  await audit({
    actorId: owner.id,
    action: "DELETE_CATEGORY",
    entityType: "menuCategory",
    entityId: category.id,
    details: { name: category.name, softDelete: true }
  });

  return NextResponse.json({ ok: true });
}
