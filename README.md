# Big Brew - Frontend

A touch-optimized POS and admin dashboard for independent craft coffee shops. Built as a single-page application that communicates with the Big Brew API.

## Features

**POS (Point of Sale)**
- Menu grid grouped by category with image thumbnails
- Item customization: sizes, toppings, sugar levels, modifier groups (single/multi select)
- Order-level and item-level discounts (percentage, fixed amount, BOGO)
- Cart persisted to `localStorage` across sessions
- Payment processing: cash (with change calculation) and QR
- Order queue with status tracking and void workflow
- Dine-in / takeout order types

**Admin Dashboard**
- Revenue analytics with date range filtering, top items, expense breakdown
- Menu management: create/edit menu items, recipes, modifier groups, categories
- Inventory: ingredient tracking, stock adjustments with history
- Employee management: create, update, deactivate, reset PINs
- Order management: view, filter, void approval workflow
- Expense tracking with categories and summary
- Discount management 
- Terminal management
- Store settings with receipt logo upload and custom header/footer
- Role-based access 

## Architecture

```
main.tsx                    # Entry: StrictMode → QueryClient → AuthProvider → IconProvider → Root
  └── App.tsx               # Lazy-loaded route tree (only LoginPage is eager)
       ├── /login            LoginPage
       ├── /                 POSPage → POSLayout
       │    ├── /            MenuView (category tabs + item grid)
       │    ├── /payment     PaymentView (tender, QR, receipt)
       │    └── OrderQueue   (persistent sidebar column)
       └── /admin            AdminLayout (sidebar nav + mobile sheet)
            ├── Dashboard, Menu, Categories, Inventory
            ├── Employees, Orders, Expenses, ExpenseCategories
            ├── Discounts, Terminals, Settings
            └── Create/Edit sub-pages for each domain
```

**Key patterns:**
- TanStack Query for all server state (`useQuery`/`useMutation`) — query key factories in `lib/query-keys.ts`
- `usePOS()` context for cart state, discount logic, and order submission
- Axios interceptor with automatic 401 retry and token refresh queue
- Token stored in `sessionStorage` — not React state
- React.lazy + Suspense for code-splitting all admin pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript 6 |
| Build | Vite 8, `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4, `tw-animate-css`, `shadcn/tailwind.css` |
| UI | shadcn/ui (base-nova), `@base-ui/react` primitives |
| Icons | Phosphor Icons (duotone via `IconProvider`) |
| Data | TanStack Query v5, axios |
| Routing | react-router-dom v7 (BrowserRouter declarative) |
| Charts | recharts |
| Payments | QR code rendering via `qrcode.react` |
| Testing | Vitest, jsdom, Testing Library, axios-mock-adapter |
| Linting | ESLint |
| Formatting | Prettier |
