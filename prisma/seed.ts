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

  const categoryRows = await prisma.menuCategory.findMany({
    where: { slug: { in: categories.map((category) => category.slug) } },
    select: { id: true, slug: true }
  });
  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category.id]));

  const menuItems = [
    { id: "seed-set-hit", categorySlug: "sets", name: "Сет Хит", description: "Филадельфия, Калифорния, темпура ролл и маки.", sellingPrice: 7990, costPrice: 4300, setBuilderPrice: 7990, weight: "32 шт", isSetBuilderEnabled: false },
    { id: "seed-set-family", categorySlug: "sets", name: "Семейный сет", description: "Большой набор роллов для семьи или компании.", sellingPrice: 11990, costPrice: 6700, setBuilderPrice: 11990, weight: "48 шт", isSetBuilderEnabled: false },
    { id: "seed-set-baked", categorySlug: "sets", name: "Запеченный сет", description: "Горячие запеченные роллы с фирменными соусами.", sellingPrice: 8990, costPrice: 5000, setBuilderPrice: 8990, weight: "32 шт", isSetBuilderEnabled: false },
    { id: "seed-set-mini", categorySlug: "sets", name: "Мини сет", description: "Компактный сет из популярных роллов.", sellingPrice: 4990, costPrice: 2700, setBuilderPrice: 4990, weight: "20 шт", isSetBuilderEnabled: false },
    { id: "seed-sushi-philadelphia", categorySlug: "sushi", name: "Филадельфия", description: "Лосось, сливочный сыр, рис, нори.", sellingPrice: 2490, costPrice: 1350, setBuilderPrice: 2100, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-california", categorySlug: "sushi", name: "Калифорния", description: "Краб, огурец, тобико, рис, нори.", sellingPrice: 2190, costPrice: 1120, setBuilderPrice: 1850, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-canada", categorySlug: "sushi", name: "Канада", description: "Угорь, сливочный сыр, огурец, унаги соус.", sellingPrice: 2790, costPrice: 1550, setBuilderPrice: 2350, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-tempura", categorySlug: "sushi", name: "Темпура ролл", description: "Горячий ролл в темпуре с сыром и начинкой.", sellingPrice: 2290, costPrice: 1180, setBuilderPrice: 1950, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-baked-salmon", categorySlug: "sushi", name: "Запеченный с лососем", description: "Лосось, сырный соус, рис, нори.", sellingPrice: 2390, costPrice: 1250, setBuilderPrice: 2050, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-baked-chicken", categorySlug: "sushi", name: "Запеченный с курицей", description: "Курица, сливочный сыр, сырный соус.", sellingPrice: 1990, costPrice: 980, setBuilderPrice: 1700, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-ebi", categorySlug: "sushi", name: "Эби ролл", description: "Креветка, огурец, сливочный сыр.", sellingPrice: 2590, costPrice: 1400, setBuilderPrice: 2200, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-sake-maki", categorySlug: "sushi", name: "Сяке маки", description: "Классические маки с лососем.", sellingPrice: 1390, costPrice: 720, setBuilderPrice: 1190, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-sushi-kappa-maki", categorySlug: "sushi", name: "Каппа маки", description: "Классические маки с огурцом.", sellingPrice: 890, costPrice: 360, setBuilderPrice: 760, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-pizza-pepperoni", categorySlug: "pizza", name: "Пепперони", description: "Пепперони, сыр моцарелла, томатный соус.", sellingPrice: 3290, costPrice: 1650, setBuilderPrice: 3290, weight: "30 см", isSetBuilderEnabled: false },
    { id: "seed-pizza-margarita", categorySlug: "pizza", name: "Маргарита", description: "Моцарелла, томаты, фирменный соус.", sellingPrice: 2790, costPrice: 1350, setBuilderPrice: 2790, weight: "30 см", isSetBuilderEnabled: false },
    { id: "seed-pizza-chicken", categorySlug: "pizza", name: "Куриная пицца", description: "Курица, сыр, томаты, соус.", sellingPrice: 3190, costPrice: 1550, setBuilderPrice: 3190, weight: "30 см", isSetBuilderEnabled: false },
    { id: "seed-pizza-4cheese", categorySlug: "pizza", name: "4 сыра", description: "Моцарелла, гауда, дорблю, пармезан.", sellingPrice: 3490, costPrice: 1800, setBuilderPrice: 3490, weight: "30 см", isSetBuilderEnabled: false },
    { id: "seed-pizza-assorti", categorySlug: "pizza", name: "Ассорти", description: "Колбаса, курица, грибы, овощи и сыр.", sellingPrice: 3590, costPrice: 1850, setBuilderPrice: 3590, weight: "30 см", isSetBuilderEnabled: false },
    { id: "seed-snack-fries", categorySlug: "snacks", name: "Картофель фри", description: "Хрустящий картофель с соусом.", sellingPrice: 990, costPrice: 420, setBuilderPrice: 850, weight: "150 г", isSetBuilderEnabled: true },
    { id: "seed-snack-nuggets", categorySlug: "snacks", name: "Наггетсы", description: "Куриные наггетсы с соусом.", sellingPrice: 1290, costPrice: 620, setBuilderPrice: 1100, weight: "8 шт", isSetBuilderEnabled: true },
    { id: "seed-snack-cheese-sticks", categorySlug: "snacks", name: "Сырные палочки", description: "Горячие сырные палочки в панировке.", sellingPrice: 1490, costPrice: 760, setBuilderPrice: 1250, weight: "6 шт", isSetBuilderEnabled: true },
    { id: "seed-snack-wings", categorySlug: "snacks", name: "Крылышки", description: "Куриные крылышки в фирменном соусе.", sellingPrice: 1790, costPrice: 900, setBuilderPrice: 1550, weight: "6 шт", isSetBuilderEnabled: true },
    { id: "seed-drink-cola", categorySlug: "drinks", name: "Coca-Cola 1 л", description: "Охлажденный напиток.", sellingPrice: 790, costPrice: 420, setBuilderPrice: 790, weight: "1 л", isSetBuilderEnabled: false },
    { id: "seed-drink-fanta", categorySlug: "drinks", name: "Fanta 1 л", description: "Охлажденный напиток.", sellingPrice: 790, costPrice: 420, setBuilderPrice: 790, weight: "1 л", isSetBuilderEnabled: false },
    { id: "seed-drink-sprite", categorySlug: "drinks", name: "Sprite 1 л", description: "Охлажденный напиток.", sellingPrice: 790, costPrice: 420, setBuilderPrice: 790, weight: "1 л", isSetBuilderEnabled: false },
    { id: "seed-drink-water", categorySlug: "drinks", name: "Вода 0.5 л", description: "Питьевая вода без газа.", sellingPrice: 390, costPrice: 180, setBuilderPrice: 390, weight: "0.5 л", isSetBuilderEnabled: false }
  ];

  for (const item of menuItems) {
    const categoryId = categoryBySlug.get(item.categorySlug);
    if (!categoryId) continue;

    const data = {
      name: item.name,
      description: item.description,
      categoryId,
      imageUrl: null,
      sellingPrice: item.sellingPrice,
      costPrice: item.costPrice,
      setBuilderPrice: item.setBuilderPrice,
      weight: item.weight,
      ingredients: item.description,
      isAvailable: true,
      isActive: true,
      isSetBuilderEnabled: item.isSetBuilderEnabled
    };

    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data }
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
