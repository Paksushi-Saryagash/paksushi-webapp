import { NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/lib/auth";

const schema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const user = await login(body.data.login, body.data.password);
  if (!user) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
