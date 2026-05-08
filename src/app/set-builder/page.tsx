import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public/PublicHeader";
import { SetBuilderClient } from "@/components/public/SetBuilderClient";

export const dynamic = "force-dynamic";

export default async function SetBuilderPage() {
  const categories = await prisma.menuCategory.findMany({
    where: {
      isActive: true,
      slug: { notIn: ["sets", "drinks"] }
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
          isSetBuilderEnabled: true,
          NOT: [
            { name: { contains: "соус", mode: "insensitive" } },
            { name: { contains: "халапеньо", mode: "insensitive" } }
          ]
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
