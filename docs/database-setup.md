# NovaX Pro Database Setup

This project is currently wired for PostgreSQL through Prisma while keeping `APP_MODE="sandbox"`.
The API structure is ready for database-backed users, balances, deposits, withdrawals, orders, ledgers, and audit logs.
It does **not** enable real payments, real wallets, real chain transfers, or production trading by itself.

## 1. Prepare PostgreSQL

Use one of these options:

- Local PostgreSQL
- Supabase PostgreSQL
- Neon PostgreSQL
- Any compatible managed PostgreSQL provider

Create a database for the project, for example:

```txt
novax
```

## 2. Configure `.env`

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Then set your database URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
APP_MODE="sandbox"
PAYMENT_PROVIDER="mock"
CUSTODY_PROVIDER="mock"
KYC_PROVIDER="mock"
AML_PROVIDER="mock"
```

For Supabase or Neon, paste the provider connection string into `DATABASE_URL`.

## 3. Generate Prisma Client

```bash
npx prisma generate
```

## 4. Create Database Tables

```bash
npx prisma migrate dev --name init
```

This creates the tables from `prisma/schema.prisma`.

## 5. Start the Development Server

```bash
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

## 6. Build Check

```bash
npm.cmd run build
```

## 7. Sandbox Notes

- API responses still include `sandbox: true`.
- Provider adapters are mock implementations.
- No real payment provider is called.
- No real custody wallet is called.
- No real blockchain transfer is performed.
- All balance updates must go through `src/lib/ledger.ts`.

## 8. Default Admin Account

The database-backed auth route creates the default admin when needed:

```txt
Email: admin@novax.demo
Password: Admin123456
```

The password logic is sandbox-only. Before production, replace it with bcrypt or argon2 hashing and proper session management.

## Admin-controlled trading page update

After applying the latest update, run:

```bash
npx prisma generate
npx prisma migrate dev --name market_order_admin
npx prisma db seed
npm.cmd run dev
```

New database-backed demo modules:

- `/exchange-demo/trading` reads market prices from `MarketPair` and creates filled sandbox orders.
- `/exchange-demo/assets` reads user asset balances from the database.
- `/admin/markets` lets the administrator edit trading pair price, 24H change, high, low, volume, and visibility.
- `/admin/orders` lets the administrator review and manually change demo order status.

This update still does not connect real payments, real wallets, real chains, or external exchanges. All order and balance flows are sandbox/database controlled.
