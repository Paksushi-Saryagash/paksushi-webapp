import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const body = schema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  if (params.id === owner.id && (body.data.isActive === false || body.data.role === "OPERATOR")) {
    return NextResponse.json({ error: "Нельзя отключить себя или снять с себя роль владельца" }, { status: 400 });
  }

  if (body.data.role === "OPERATOR" || body.data.isActive === false) {
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true }
    });

    if (target?.role === "OWNER") {
      const activeOwners = await prisma.user.count({ where: { role: "OWNER", isActive: true } });
      if (activeOwners <= 1) {
        return NextResponse.json({ error: "Нельзя отключить последнего владельца" }, { status: 400 });
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      name: body.data.name,
      role: body.data.role,
      isActive: body.data.isActive,
      passwordHash: body.data.password ? await bcrypt.hash(body.data.password, 12) : undefined
    },
    select: {
      id: true,
      name: true,
      login: true,
      role: true,
      isActive: true
    }
  });

  await audit({
    actorId: owner.id,
    action: body.data.isActive === false ? "DEACTIVATE_USER" : "UPDATE_USER",
    entityType: "user",
    entityId: user.id,
    details: {
      name: body.data.name,
      role: body.data.role,
      isActive: body.data.isActive,
      passwordChanged: Boolean(body.data.password)
    }
  });

  return NextResponse.json({ user });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();

  if (params.id === owner.id) {
    return NextResponse.json({ error: "Нельзя удалить свой аккаунт" }, { status: 400 });
  }

  const [orders, shifts, logs] = await Promise.all([
    prisma.order.count({ where: { createdById: params.id } }),
    prisma.shift.count({ where: { operatorId: params.id } }),
    prisma.auditLog.count({ where: { actorId: params.id } })
  ]);

  if (orders > 0 || shifts > 0 || logs > 0) {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
      select: { id: true, name: true, login: true, role: true, isActive: true }
    });

    await audit({
      actorId: owner.id,
      action: "DEACTIVATE_USER",
      entityType: "user",
      entityId: user.id,
      details: { reason: "У сотрудника есть история заказов, смен или действий, поэтому аккаунт отключен вместо физического удаления" }
    });

    return NextResponse.json({ user, archived: true });
  }

  const deleted = await prisma.user.delete({
    where: { id: params.id },
    select: { id: true, name: true, login: true, role: true }
  });

  await audit({
    actorId: owner.id,
    action: "DELETE_USER",
    entityType: "user",
    entityId: deleted.id,
    details: { name: deleted.name, login: deleted.login, role: deleted.role }
  });

  return NextResponse.json({ user: deleted });
}
