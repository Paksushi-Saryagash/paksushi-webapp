# Pak Sushi Saryagash

Рабочее веб-приложение для суши-ресторана Pak Sushi: публичное меню, корзина, WhatsApp-заказы, конструктор "Собери сет", админка владельца, рабочее место оператора, смены, чеки, история заказов и журнал действий.

## Стек

- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS
- JWT cookie auth для админки
- Supabase PostgreSQL для базы данных

## Основные разделы

Публичная часть:

- `/` - меню
- `/set-builder` - собрать свой сет
- `/cart` - корзина
- `/contacts` - контакты

Админка:

- `/admin/login` - вход
- `/admin` - обзор владельца
- `/admin/orders` - прием заказов оператором
- `/admin/orders/history` - история заказов
- `/admin/visits` - смены и входы
- `/admin/menu` - меню и категории
- `/admin/set-rules` - правила конструктора сетов
- `/admin/users` - сотрудники
- `/admin/audit` - журнал действий

## Роли

`OWNER`:

- видит обзор бизнеса
- управляет меню, категориями, сетами и сотрудниками
- видит журнал действий, смены и входы
- видит финансовые данные владельца

`OPERATOR`:

- открывает и закрывает смену
- принимает заказы
- подтверждает заявки с сайта и WhatsApp
- делает возврат по заказу
- печатает чек
- не видит себестоимость и прибыль

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` на основе `.env.example`.

3. Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

4. Запустить проект:

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:3000`.

## Переменные окружения

Для локального запуска и Vercel нужны:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="long-random-secret"
NEXT_PUBLIC_WHATSAPP_PHONE="77057210505"
NEXT_PUBLIC_RESTAURANT_NAME="Pak Sushi Saryagash"
```

Важно: `.env` нельзя загружать в GitHub публично.

## Деплой

Рекомендуемая схема:

- приложение: Vercel
- база данных: Supabase PostgreSQL
- один домен для сайта, админки и API

На Vercel:

- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: оставить пустым
- Framework: Next.js

После деплоя нужно добавить переменные окружения из `.env` в Vercel Project Settings -> Environment Variables.

## Перед продакшеном

- сменить `JWT_SECRET` на новый длинный секрет
- проверить номер WhatsApp
- создать сильные пароли владельца и операторов
- не публиковать `.env`
- проверить работу заказов, смен, возвратов и чеков
