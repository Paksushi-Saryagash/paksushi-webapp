import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EditMenuItemForm } from "@/components/admin/EditMenuItemForm";

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/menu");

  const [item, categories] = await Promise.all([
    prisma.menuItem.findUnique({ where: { id: params.id } }),
    prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (!item) notFound();

  return (
    <div className="grid gap-4">
      <Link href="/admin/menu" className="text-sm font-bold text-pak-red">Назад к меню</Link>
      <div>
        <h2 className="text-2xl font-black">Редактировать блюдо</h2>
        <p className="mt-1 text-sm text-black/55">Изменения цен попадут только в новые заказы. Старые чеки сохраняют цены на момент заказа.</p>
      </div>
      <EditMenuItemForm item={item} categories={categories} />
    </div>
  );
}
