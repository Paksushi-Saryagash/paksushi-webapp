import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public/PublicHeader";
import { SetBuilderClient } from "@/components/public/SetBuilderClient";

export const dynamic = "force-dynamic";

export default async function SetBuilderPage() {
  const categories = await prisma.menuCategory.findMany({
    where: {
      isActive: true,
      slug: { not: "sets" },
      name: { notIn: ["Сеты", "Сет", "Sets"] }
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      items: {
        where: {
          isActive: true,
          isAvailable: true,
          isSetBuilderEnabled: true
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          weight: true
        }
      }
    }
  });

  return (
    <>
      <PublicHeader />
      <SetBuilderClient categories={categories.filter((category) => category.items.length > 0)} />
    </>
  );
}
