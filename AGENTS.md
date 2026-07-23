# AGENTS.md

## Stack

Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4. shadcn/ui base-nova (`components.json` `style`), `@base-ui/react` primitives. Phosphor icons (`duotone` weight via `IconProvider`; `components.json` says `lucide` — ignore). TanStack Query (first-class — `QueryClientProvider` in main.tsx, query key factories in `lib/query-keys.ts`). `react-router-dom` v7 BrowserRouter declarative mode. `sonner` toasts, `motion` (import from `motion/react`), `recharts`, `date-fns`.

Fonts: `@fontsource-variable/bricolage-grotesque` + `@fontsource/dm-mono` (imported in main.tsx). `@fontsource-variable/geist` is a stale shadcn-init dep — never use.

`react-day-picker` (calendar/date picker), `qrcode.react` (QR payments). `tw-animate-css` + `shadcn/tailwind.css` imported in `index.css`.

## Commands

```
npm run dev         # vite dev server (port 5173)
npm run build       # tsc -b && vite build (typecheck + bundle)
npm run preview     # vite preview (production build preview)
npm run lint        # eslint .
npm run format      # prettier --write . (4-space, semicolons, double quotes)
npm run test        # vitest (watch mode)
npm run test:run    # vitest run (single pass)
npx shadcn@latest add <component>
```

Prettier ignores `node_modules`, `dist`, `*.local`, `.env*`, images, fonts (see `.prettierignore`).

No CI (`.github/` exists but has no workflow files).

## Conventions

- **Path alias**: `@/` → `src/`
- **TypeScript**: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`; `verbatimModuleSyntax` → `import { type Foo }` not `import type { Foo }`
- **Arrow functions only**, no inline `style={{}}`
- **No `space-y-*`** — use `flex flex-col gap-*`
- **No raw color classes** — use semantic tokens (`bg-primary`, `text-muted-foreground`). Dark mode via `.dark` class on `<html>`. Admin/POS-specific tokens in CSS vars (`--admin-bg`, `--pos-bg`).
- **shadcn** for all interactive UI. `cn()` from `@/lib/utils` for conditional classes. `data-icon="inline-start"` / `data-icon="inline-end"` inside buttons.
- **API**: `src/api/api.ts` (axios). Base URL from `VITE_API_BASE_URL` (must include `/api`). Token stored in `sessionStorage` via `setAccessToken`/`getAccessToken` — not React state. Pass `silent: true` to suppress toasts (used during token refresh). Endpoint constants in `src/api/endpoints.ts`.
- **TanStack Query**: All data-fetching hooks in `src/hooks/` use `useQuery`/`useMutation`. Query keys from `src/lib/query-keys.ts`. Cart persists to `localStorage` (`pos-cart`, `pos-order-type` keys) — see `src/lib/cart-storage.ts`.
- **Types**: Domain types in `src/types/` (`cart.ts`, `menu.ts`, `order.ts`, `auth.ts`, `admin.ts`, `category.ts`).
- **Testing**: Vitest + jsdom, `@testing-library/react`, `axios-mock-adapter`. Setup in `src/test/setup.ts`. 5 test files exist (api, cart-storage, query-keys, order-payload, ProtectedRoute).

## Wiring

**Entry order** (main.tsx): `StrictMode > QueryClientProvider > AuthProvider > IconProvider > Root`. `Root` renders `BrowserRouter > App + Toaster` once auth is initialized.

`Root` checks `isInitialized` from `useAuth()` and renders `LoadingScreen` until session refresh resolves. `LoginPage` is the **only eager-loaded page**; every other page uses `React.lazy()` + `Suspense` → `LoadingScreen`.

**Auth**: Email/password login + terminal login. Token in `sessionStorage` (see `api.ts`). On mount, `POST /auth/refresh` with `{ silent: true }` to restore session. Interceptor queues concurrent 401 retries during refresh. `useAuth()` from `@/hooks/useAuth`. `ProtectedRoute` → `/login` if unauthenticated. `AdminRoute` redirects `barista` role to `/`.

**POS** (`/` route): `POSPage` wraps `CategoryProvider > POSProvider > POSLayout`. POSLayout renders `OrderQueue` + child route (`MenuView` at `/`, `PaymentView` at `/payment`). `CustomizeModal` shown when `customizeItem` is set. Consume via `usePOS()` from `@/hooks/usePos`. Cart→API payload built in `src/lib/order-payload.ts`. Route constants in `src/lib/constants.ts`. `generateCartId()` in `src/lib/utils.ts` uses `crypto.randomUUID()`.

**Admin** (`/admin`): `AdminLayout` with sidebar nav + mobile sheet. Lazy-loaded pages under `src/pages/admin/` — Dashboard, Menu, MenuItemCreate/Edit, Categories, Inventory, IngredientCreate/Detail, Employees, EmployeeCreate/Detail, Orders, Expenses, ExpenseCreate, ExpenseCategories, Discounts, DiscountCreate/Edit, Terminals, TerminalEdit, Settings.

## Design

`DESIGN.md` has the full design system (colors, typography, spacing, components). `PRODUCT.md` has brand personality, user personas, and product purpose. Both are source-of-truth for look-and-feel decisions.

## Before committing

```
npm run format && npm run lint && npm run build
```

## Shadcn CLI Gotchas

- After `npx shadcn@latest add`, files land under `@/components/` — move to `src/components/ui/`
- Community registry imports may hardcode wrong paths — fix manually
- `@fontsource-variable/geist` is a stale shadcn-init dep — never use
- VS Code schema warning on `components.json` is harmless
