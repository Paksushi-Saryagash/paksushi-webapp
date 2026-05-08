import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ownerPasswordHash = await bcrypt.hash("owner12345", 12);
  const operatorPasswordHash = await bcrypt.hash("operator12345", 12);

  const owner = await prisma.user.upsert({
    where: { login: "owner" },
    update: {},
    create: {
      name: "Владелец Pak Sushi",
      login: "owner",
      passwordHash: ownerPasswordHash,
      role: UserRole.OWNER
    }
  });

  await prisma.user.upsert({
    where: { login: "operator" },
    update: {},
    create: {
      name: "Оператор",
      login: "operator",
      passwordHash: operatorPasswordHash,
      role: UserRole.OPERATOR
    }
  });

  const categories = [
    { name: "Сеты", slug: "sets", sortOrder: 1 },
    { name: "Суши", slug: "sushi", sortOrder: 2 },
    { name: "Пицца", slug: "pizza", sortOrder: 3 },
    { name: "Закуски", slug: "snacks", sortOrder: 4 },
    { name: "Напитки", slug: "drinks", sortOrder: 5 }
  ];

  for (const category of categories) {
    await prisma.menuCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  await prisma.setBuilderRule.upsert({
    where: { id: "default-set-rule" },
    update: {},
    create: {
      id: "default-set-rule",
      name: "Основное правило конструктора",
      threshold: 5000,
      isActive: true,
      useSetPriceSum: true
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: owner.id,
      action: "CREATE_USER",
      entityType: "seed",
      details: { message: "Initial empty Pak Sushi setup completed" }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
