import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SetRuleForm } from "@/components/admin/SetRuleForm";

export default async function SetRulesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/orders");

  const rule = await prisma.setBuilderRule.findFirst({ where: { isActive: true } });

  return (
    <div className="grid gap-4">
      <SetRuleForm threshold={rule?.threshold ?? 5000} isActive={rule?.isActive ?? true} useSetPriceSum={rule?.useSetPriceSum ?? true} />
      <div className="rounded-[8px] bg-white p-5 text-sm text-black/65">
        Клиент видит только итоговую цену. Порог, цена для сета и себестоимость остаются внутренними данными ресторана.
      </div>
    </div>
  );
}
