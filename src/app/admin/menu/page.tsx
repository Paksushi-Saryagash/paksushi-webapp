import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Price } from "@/components/shared/Price";
import { CreateCategoryForm } from "@/components/admin/CreateCategoryForm";
import { CreateMenuItemForm } from "@/components/admin/CreateMenuItemForm";
import { MenuItemActions } from "@/components/admin/MenuItemActions";
import { CategoryActions } from "@/components/admin/CategoryActions";

export default async function AdminMenuPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/orders");

  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      include: { category: true }
    }),
    prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, sortOrder: true, isActive: true }
    })
  ]);

  return (
    <div className="grid gap-6">
      {user.role === "OWNER" && (
        <>
          <CreateCategoryForm />
          <CreateMenuItemForm categories={categories.filter((category) => category.isActive)} />
        </>
      )}

      <section className="rounded-[8px] bg-white p-5">
        <div>
          <h2 className="text-lg font-black">Категории</h2>
          <p className="mt-1 text-sm text-black/55">Категории управляют вкладками на публичном меню.</p>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="text-xs uppercase text-black/45">
              <tr>
                <th className="py-2">Название</th>
                <th>Slug</th>
                <th>Порядок</th>
                <th>Статус</th>
                {user.role === "OWNER" && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-black/10">
                  <td className="py-3 font-bold">{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.sortOrder}</td>
                  <td>{category.isActive ? "Активна" : "Отключена"}</td>
                  {user.role === "OWNER" && (
                    <td>
                      <CategoryActions id={category.id} isActive={category.isActive} />
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-black/50">
                    Категорий пока нет. Добавьте первую категорию выше.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[8px] bg-white p-5">
        <div>
          <h2 className="text-lg font-black">Меню и цены</h2>
          <p className="mt-1 text-sm text-black/55">Обычная цена, себестоимость и цена для сета хранятся отдельно.</p>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="text-xs uppercase text-black/45">
              <tr>
                <th className="py-2">Фото</th>
                <th className="py-2">Название</th>
                <th>Категория</th>
                <th>Обычная цена</th>
                <th>Себестоимость</th>
                <th>Цена для сета</th>
                <th>Конструктор</th>
                <th>Доступность</th>
                {user.role === "OWNER" && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-black/10">
                  <td className="py-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-14 w-20 rounded-[8px] object-cover" />
                    ) : (
                      <div className="grid h-14 w-20 place-items-center rounded-[8px] bg-pak-cream text-xs font-bold text-black/35">
                        Нет фото
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-bold">{item.name}</td>
                  <td>{item.category.name}</td>
                  <td><Price value={item.sellingPrice} /></td>
                  <td><Price value={item.costPrice} /></td>
                  <td><Price value={item.setBuilderPrice} /></td>
                  <td>{item.isSetBuilderEnabled ? "Да" : "Нет"}</td>
                  <td>{item.isAvailable ? "В наличии" : "Нет"}</td>
                  {user.role === "OWNER" && (
                    <td>
                      <MenuItemActions
                        id={item.id}
                        isAvailable={item.isAvailable}
                        isActive={item.isActive}
                        isSetBuilderEnabled={item.isSetBuilderEnabled}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={user.role === "OWNER" ? 9 : 8} className="py-8 text-center text-black/50">
                    Позиции меню пока не добавлены. Владелец может добавить первое блюдо через форму выше.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
