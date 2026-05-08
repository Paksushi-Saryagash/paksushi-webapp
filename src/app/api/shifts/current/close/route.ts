import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getOpenShift, summarizeShift } from "@/lib/shift";

const closeSchema = z.object({
  closingNote: z.string().optional().nullable(),
  endingCash: z.number().int().nonnegative().optional().nullable()
});

export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = closeSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const shift = await getOpenShift(user.id);
  if (!shift) {
    return NextResponse.json({ error: "Открытая смена не найдена" }, { status: 404 });
  }

  const summary = await summarizeShift(shift.id);

  const closedShift = await prisma.shift.update({
    where: { id: shift.id },
    data: {
      isOpen: false,
      closedAt: new Date(),
      closingNote: body.data.closingNote,
      endingCash: body.data.endingCash,
      orderCount: summary?.orderCount ?? 0,
      revenueTotal: summary?.revenueTotal ?? 0,
      refundTotal: summary?.refundTotal ?? 0
    }
  });

  await audit({
    actorId: user.id,
    action: "CLOSE_SHIFT",
    entityType: "shift",
    entityId: closedShift.id,
    details: {
      orderCount: closedShift.orderCount,
      revenueTotal: closedShift.revenueTotal,
      refundTotal: closedShift.refundTotal,
      endingCash: closedShift.endingCash,
      note: closedShift.closingNote
    }
  });

  return NextResponse.json({ shift: closedShift });
}
