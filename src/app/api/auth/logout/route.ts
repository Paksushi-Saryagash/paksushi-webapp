import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    void audit({
      actorId: user.id,
      action: "LOGOUT",
      entityType: "user",
      entityId: user.id
    }).catch(() => {});
  }
  clearSession();
  return NextResponse.json({ ok: true });
}
