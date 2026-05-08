import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  threshold: z.number().int().nonnegative(),
  isActive: z.boolean(),
  useSetPriceSum: z.boolean()
});

export async function GET() {
  await requireOwner();
  const rules = await prisma.setBuilderRule.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ rules });
}

export async function PATCH(request: Request) {
  const owner = await requireOwner();
  const body = schema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const current = await prisma.setBuilderRule.findFirst({ where: { isActive: true } });
  const rule = await prisma.setBuilderRule.upsert({
    where: { id: current?.id ?? "default-set-rule" },
    create: {
      id: "default-set-rule",
      name: "Основное правило конструктора",
      ...body.data
    },
    update: body.data
  });

  await audit({
    actorId: owner.id,
    action: "UPDATE_SET_RULE",
    entityType: "setBuilderRule",
    entityId: rule.id,
    details: body.data
  });

  return NextResponse.json({ rule });
}
