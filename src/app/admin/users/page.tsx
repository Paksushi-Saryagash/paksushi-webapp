import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserActions } from "@/components/admin/UserActions";

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, login: true, role: true, isActive: true, createdAt: true }
  });

  const activeUsers = users.filter((employee) => employee.isActive);
  const disabledUsers = users.filter((employee) => !employee.isActive);

  return (
    <div className="grid gap-6">
      <CreateUserForm />

      <section className="rounded-[8px] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase text-pak-red">Доступы</p>
        <h2 className="mt-1 text-2xl font-black">Сотрудники</h2>
        <p className="mt-1 text-sm text-black/55">
          В основном списке показываются только активные аккаунты. Если сотрудника нельзя удалить из-за истории заказов или смен, он отключается и уходит в архив ниже.
        </p>

        <div className="mt-4 overflow-auto">
          <UsersTable users={activeUsers} emptyText="Активных сотрудников нет." />
        </div>
      </section>

      {disabledUsers.length > 0 && (
        <section className="rounded-[8px] bg-white/70 p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-black/45">Архив</p>
          <h2 className="mt-1 text-xl font-black">Отключенные аккаунты</h2>
          <p className="mt-1 text-sm text-black/50">Эти сотрудники не могут войти в систему. Их можно включить обратно, если понадобится.</p>

          <div className="mt-4 overflow-auto">
            <UsersTable users={disabledUsers} emptyText="Отключенных аккаунтов нет." muted />
          </div>
        </section>
      )}
    </div>
  );
}

function UsersTable({
  users,
  emptyText,
  muted = false
}: {
  users: Array<{ id: string; name: string; login: string; role: "OWNER" | "OPERATOR"; isActive: boolean }>;
  emptyText: string;
  muted?: boolean;
}) {
  if (users.length === 0) {
    return <div className="rounded-[8px] border border-dashed border-black/15 p-6 text-center text-sm font-semibold text-black/45">{emptyText}</div>;
  }

  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="text-xs uppercase text-black/45">
        <tr>
          <th className="py-2">Имя</th>
          <th>Логин</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody className={muted ? "opacity-75" : undefined}>
        {users.map((employee) => (
          <tr key={employee.id} className="border-t border-black/10">
            <td className="py-3 font-bold">{employee.name}</td>
            <td>{employee.login}</td>
            <td>{employee.role === "OWNER" ? "Админ" : "Оператор"}</td>
            <td>{employee.isActive ? "Активен" : "Отключен"}</td>
            <td>
              <UserActions id={employee.id} isActive={employee.isActive} role={employee.role} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
