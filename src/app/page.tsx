import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public/PublicHeader";
import { MenuClient } from "@/components/public/MenuClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      items: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          sellingPrice: true,
          weight: true,
          isAvailable: true
        }
      }
    }
  });

  return (
    <>
      <PublicHeader />
      <MenuClient categories={categories} />
    </>
  );
}
