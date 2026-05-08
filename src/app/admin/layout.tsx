import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) return <>{children}</>;

  return <AdminShell user={user}>{children}</AdminShell>;
}
