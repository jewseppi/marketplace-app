# Crypto Couture Marketplace

Crypto Couture Marketplace is a **demo/prototype** luxury resale storefront built with Next.js 15. It simulates a crypto-native checkout flow, seller operations, and admin reporting without requiring a real wallet, chain, or external database service.

## What this is

- Luxury marketplace UI with curated products
- Mock crypto checkout using BTC / ETH / USDT / USDC
- SQLite-backed catalog, cart, and order storage
- Demo seller dashboard and admin panel
- Mock smart-contract + wallet simulation for productized checkout demos

## Features

- Public storefront with featured products, search, category filters, and product detail pages
- Cart + checkout flow backed by API routes and SQLite
- Mock blockchain confirmation flow with transaction hashes and order confirmation page
- Seller dashboard for inventory, orders, and analytics
- Admin panel for users, reports, and platform settings
- Loading states, product skeletons, error boundaries, and missing-image fallback handling
- Docker, Docker Compose, and Vercel deployment config included

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- better-sqlite3
- Framer Motion
- Mock wallet / mock contract utilities

## Demo credentials

- Seller: `seller` / `seller123`
- Admin: `admin` / `admin123`

## Quick start

### Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Production-style local run

```bash
npm install
npm run build
npm run start
```

### Seed data

The app auto-seeds the SQLite catalog on first run. You can also run:

```bash
npm run seed
```

## Docker quick start

```bash
docker compose up --build
```

Then open http://localhost:3000

Notes:
- App runs on Node 22
- SQLite data is persisted in the `marketplace_data` Docker volume
- The container runs as a non-root user

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run smoke
npm run seed
```

## Pages overview

### Public

- `/` — landing page + product discovery
- `/product/[id]` — product detail page
- `/checkout` — mock wallet + crypto checkout
- `/checkout/confirm/[id]` — order confirmation details

### Seller

- `/seller` — seller overview
- `/seller/products` — manage inventory
- `/seller/orders` — review and update order statuses
- `/seller/analytics` — mock seller reporting

### Admin

- `/admin` — admin overview
- `/admin/users` — mock user management
- `/admin/reports` — revenue and platform metrics
- `/admin/settings` — fee + payment config mock UI

## API endpoints

- `GET /api/products` — list products
- `GET /api/products?id=<id>` — fetch one product
- `GET /api/products?category=<category>&search=<query>` — filtered product listing
- `GET /api/cart` — get active cart
- `POST /api/cart` — mutate cart (`add`, `set-quantity`, `remove`, `clear`)
- `GET /api/orders` — list orders
- `GET /api/orders?orderId=<id>` — fetch one order
- `POST /api/orders` — create order from current cart

## Mock smart contract info

This project includes a **mock** marketplace contract flow for demo purposes:

- Contract helper: `src/contracts/marketplace.ts`
- Mock contract runtime: `src/lib/mock-contract.ts`
- Mock wallet runtime: `src/lib/mock-wallet.ts`
- Confirmation page shows simulated transaction hashes and order IDs

No real blockchain transactions are broadcast.

## Data storage

- SQLite database file lives in `data/marketplace.db`
- Product catalog is seeded from local project data
- Orders and carts are stored locally for demo use

## Verification

Verified during this slice with:

```bash
npm run build
npm run smoke
```

## Deployment notes

### Docker

- Uses a multi-stage build
- Uses Next.js standalone output
- Mount `/app/data` to persist SQLite data

### Vercel

`vercel.json` is included for standard Next.js deployment. Keep in mind this demo currently expects writable local SQLite storage, so persistent hosted database behavior is not part of the prototype.

## License

Currently **UNLICENSED**. Treat this repository as a private demo/prototype unless you add a license file.
