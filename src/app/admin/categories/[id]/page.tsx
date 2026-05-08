import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EditCategoryForm } from "@/components/admin/EditCategoryForm";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/menu");

  const category = await prisma.menuCategory.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, slug: true, sortOrder: true, isActive: true }
  });

  if (!category) notFound();

  return (
    <div className="grid gap-4">
      <Link href="/admin/menu" className="text-sm font-bold text-pak-red">Назад к меню</Link>
      <div>
        <h2 className="text-2xl font-black">Редактировать категорию</h2>
        <p className="mt-1 text-sm text-black/55">Название и порядок меняют вкладки публичного меню.</p>
      </div>
      <EditCategoryForm category={category} />
    </div>
  );
}
