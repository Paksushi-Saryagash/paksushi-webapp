import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true)
});

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  const body = schema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  let category;
  try {
    category = await prisma.menuCategory.create({ data: body.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Категория с таким slug уже существует" }, { status: 409 });
    }
    throw error;
  }

  await audit({
    actorId: owner.id,
    action: "CREATE_CATEGORY",
    entityType: "menuCategory",
    entityId: category.id,
    details: { name: category.name, slug: category.slug }
  });

  return NextResponse.json({ category }, { status: 201 });
}
