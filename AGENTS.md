# AGENTS.md

## Stack

- Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4
- shadcn/ui (base-nova, @base-ui/react primitives, lucide icons)
- axios API layer, react-router-dom (**BrowserRouter** — URL-based navigation), sonner toasts
- motion (animations), recharts (charts)
- Fonts: Bricolage Grotesque (sans/heading), DM Mono (mono) — loaded via `@fontsource`

## Commands

```
npm run dev       # dev server
npm run build     # tsc -b && vite build (only typecheck — no separate lint/typecheck scripts)
npm run format    # prettier --write .
npx shadcn@latest add <component>
```

No test runner, linter, or CI is configured. `tsc -b` in the build script is the only type checking.

## Shadcn UI — Always Use Components

- Every UI element must use shadcn components (Button, Card, Input, Dialog, etc.). Never raw Tailwind for interactive UI.
- Components: `src/components/ui/`. Utility: `@/lib/utils` (`cn()` for conditional classes).
- Icons from `lucide-react`; use `data-icon="inline-start"` / `data-icon="inline-end"` inside buttons.
- No `space-y-*` — use `flex flex-col gap-*`.
- No raw color classes (`bg-blue-500`) — use semantic tokens only (`bg-primary`, `text-muted-foreground`).
- `size-*` for equal dimensions, `truncate` shorthand.

## Coffee Theme (Caffeine)

Warm brown/amber palette applied from https://tweakcn.com/r/themes/caffeine.json.

- Light: cream background (`oklch 0.98`), brown primary (`oklch 0.43`)
- Dark: deep brown background (`oklch 0.18`), warm amber primary (`oklch 0.92`)
- Toggle dark mode by adding/removing the `.dark` class on `<html>`.
- All design must follow this palette — do not introduce colors outside the theme variables.

## Conventions

- **Path alias**: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)
- **Prettier**: 4-space indent, semicolons ON, double quotes — non-standard; run `npm run format` before committing
- **TS strictness**: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` — no explicit `import type` needed
- **No `baseUrl`** in tsconfig — deprecated in TS 6; paths resolve relative to tsconfig location
- **Arrow functions only**: Always use arrow functions (`const fn = () => {}`), never `function` declarations
- **No inline styles**: Use Tailwind classes instead of `style={{}}` objects. Map hardcoded colors to theme tokens (`bg-background`, `text-muted-foreground`, etc.).
- **API**: `src/api/api.ts` (axios), base URL from `VITE_API_BASE_URL` env var (see `.env.example`)

## Architecture

- **Router**: `BrowserRouter` declarative mode — routes defined with JSX `<Routes>/<Route>` in `App.tsx`, not data routers (`createBrowserRouter`). No loaders, actions, or `useLoaderData`. Use `useNavigate`, `useParams`, `useSearchParams`. Initial entry is `/login`. Protected routes redirect to `/login`.
- **Auth**: Two auth flows — email/password login and PIN verification. Token refresh is automatic via axios interceptor with a queuing system.
  - `AuthProvider` is wired into `main.tsx` — wraps the entire app tree.
  - Access token is managed as module-level state in `api.ts` (not React state).
  - Pass `silent: true` in axios request config to suppress toast errors (used during silent token refresh).
- **POS page**: Route-level page at `pages/POSPage.tsx` wraps `POSProvider` + `CategoryProvider` + `POSLayout`. The main views (`MenuView`, `PaymentView`) live in `components/pos/` as child routes under `/`.
- **Contexts**: Two providers — `AuthContext` (auth state, login/logout/PIN verify) and `POSContext` (cart items, order type, customization, editing). `POSContext` must be used within `POSProvider`.

## CSS Utilities (in `src/index.css`)

- `.scrollbar-hide` — hides scrollbars
- `.pos-scroll` — custom 4px scrollbar for POS columns
- `.keypad-btn` — hover/active effects for keypad
- `.urgent-pulse` — pulse animation for urgent orders
- `.charge-ready` — pulse glow for confirm payment button
- `.grain-overlay` — texture overlay pseudo-element

## Shadcn CLI Gotchas

- After `npx shadcn@latest add`, files may land literally under `@/components/` — move them to `src/components/ui/`.
- `@fontsource-variable/geist` is a leftover dep from shadcn init; the app uses Bricolage Grotesque + DM Mono instead. Remove geist imports if they reappear.
- VS Code schema warning on `components.json` is harmless.
- When adding components from community registries, check for hardcoded import paths that don't match `@/`.

## Layout

```
src/
  api/           # axios instance + interceptors, endpoint constants
  assets/        # static assets
  components/
    common/      # shared custom components (LoadingScreen, ProtectedRoute)
    pos/         # POS views + sub-components (MenuView, PaymentView, Cart, MenuGrid, etc.)
    ui/          # shadcn components (auto-managed by CLI)
  contexts/      # React contexts (AuthContext, POSContext)
  hooks/         # custom React hooks (useAuth)
  layouts/       # layout wrapper components (POSLayout)
  lib/           # cn() utility, constants (routes, app name)
  pages/         # route-level page components (LoginPage, POSPage)
  types/         # TS type definitions
  App.tsx        # root component with routes
  main.tsx       # entry point (BrowserRouter, AuthProvider, font imports)
```
