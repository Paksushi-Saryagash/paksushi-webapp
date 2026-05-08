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
        <div className="mt-4 grid gap-3 md:hidden">
          {categories.map((category) => (
            <article key={category.id} className="rounded-[8px] border border-black/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-black">{category.name}</h3>
                  <p className="mt-1 text-xs font-bold text-black/45">{category.slug} · #{category.sortOrder}</p>
                </div>
                <span className="shrink-0 rounded-full bg-pak-cream px-2.5 py-1 text-[11px] font-black">
                  {category.isActive ? "Активна" : "Отключена"}
                </span>
              </div>
              {user.role === "OWNER" && (
                <div className="mt-3">
                  <CategoryActions id={category.id} isActive={category.isActive} />
                </div>
              )}
            </article>
          ))}
          {categories.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-black/15 p-6 text-center text-sm font-semibold text-black/45">
              Категорий пока нет.
            </div>
          )}
        </div>
        <div className="mt-4 hidden overflow-auto md:block">
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
        <div className="mt-4 grid gap-3 md:hidden">
          {items.map((item) => (
            <article key={item.id} className="rounded-[8px] border border-black/10 p-3">
              <div className="flex gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-24 shrink-0 rounded-[8px] object-cover" />
                ) : (
                  <div className="grid h-20 w-24 shrink-0 place-items-center rounded-[8px] bg-pak-cream text-[11px] font-bold text-black/35">
                    Нет фото
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-black leading-tight">{item.name}</h3>
                  <p className="mt-1 text-xs font-bold text-black/45">{item.category.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-black/60">
                    <span><Price value={item.sellingPrice} /></span>
                    <span className="rounded-full bg-pak-cream px-2 py-1">{item.isAvailable ? "В наличии" : "Нет"}</span>
                    {item.isSetBuilderEnabled && <span className="rounded-full bg-pak-cream px-2 py-1">Собери сет</span>}
                  </div>
                </div>
              </div>
              {user.role === "OWNER" && (
                <div className="mt-3">
                  <MenuItemActions
                    id={item.id}
                    isAvailable={item.isAvailable}
                    isActive={item.isActive}
                    isSetBuilderEnabled={item.isSetBuilderEnabled}
                  />
                </div>
              )}
            </article>
          ))}
          {items.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-black/15 p-6 text-center text-sm font-semibold text-black/45">
              Позиции меню пока не добавлены.
            </div>
          )}
        </div>
        <div className="mt-4 hidden overflow-auto md:block">
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
