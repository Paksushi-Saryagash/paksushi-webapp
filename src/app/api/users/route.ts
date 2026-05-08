import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1),
  login: z.string().min(3),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole)
});

export async function GET() {
  await requireOwner();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      login: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  const body = schema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Проверьте имя, логин и пароль. Пароль минимум 8 символов." }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: body.data.name,
        login: body.data.login,
        passwordHash: await bcrypt.hash(body.data.password, 12),
        role: body.data.role
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
      action: "CREATE_USER",
      entityType: "user",
      entityId: user.id,
      details: { login: user.login, role: user.role }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Такой логин уже занят" }, { status: 409 });
    }

    return NextResponse.json({ error: "Не удалось добавить сотрудника" }, { status: 500 });
  }
}
