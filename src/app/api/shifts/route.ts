import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getOpenShift } from "@/lib/shift";

const openSchema = z.object({
  openingNote: z.string().optional().nullable(),
  startingCash: z.number().int().nonnegative().default(0)
});

export async function GET() {
  const user = await requireAdmin();
  const openShift = await getOpenShift(user.id);
  return NextResponse.json({ shift: openShift });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = openSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const existing = await getOpenShift(user.id);
  if (existing) {
    return NextResponse.json({ error: "У вас уже открыта смена", shift: existing }, { status: 400 });
  }

  const shift = await prisma.shift.create({
    data: {
      operatorId: user.id,
      openingNote: body.data.openingNote,
      startingCash: body.data.startingCash
    }
  });

  await audit({
    actorId: user.id,
    action: "OPEN_SHIFT",
    entityType: "shift",
    entityId: shift.id,
    details: { note: shift.openingNote, startingCash: shift.startingCash }
  });

  return NextResponse.json({ shift }, { status: 201 });
}
