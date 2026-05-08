import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const sessionCookie = "pak_sushi_session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  name: string;
  login: string;
  role: UserRole;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());

  cookies().set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function clearSession() {
  cookies().delete(sessionCookie);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(sessionCookie)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, getSecret());
    const payload = verified.payload as SessionUser;
    return {
      id: payload.id,
      name: payload.name,
      login: payload.login,
      role: payload.role
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireOwner() {
  const user = await requireAdmin();
  if (user.role !== "OWNER") {
    throw new Error("Owner access required");
  }
  return user;
}

export async function login(login: string, password: string) {
  const user = await prisma.user.findUnique({ where: { login } });
  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    login: user.login,
    role: user.role
  };

  await createSession(sessionUser);
  void prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "LOGIN",
      entityType: "user",
      entityId: user.id
    }
  }).catch(() => {});

  return sessionUser;
}
