# AGENTS.md

## Stack

- Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4
- shadcn/ui (base-nova, @base-ui/react primitives, lucide icons)
- axios API layer

## Commands

```
npm run dev       # dev server
npm run build     # tsc -b && vite build
npm run format    # prettier --write .
npx shadcn@latest add <component>
```

## Shadcn UI — Always Use Components

- Every UI element must use shadcn components (Button, Card, Input, Dialog, etc.). Never raw Tailwind for interactive UI.
- Components: `src/components/ui/`. Utility: `@/lib/utils` (`cn()` for conditional classes).
- Icons from `lucide-react`; use `data-icon="inline-start"` / `data-icon="inline-end"` inside buttons.
- No `space-y-*` — use `flex flex-col gap-*`.
- No raw color classes (`bg-blue-500`) — use semantic tokens only (`bg-primary`, `text-muted-foreground`).
- `size-*` for equal dimensions, `truncate` shorthand.

## Coffee Theme (Caffeine)

Applied from https://tweakcn.com/r/themes/caffeine.json. Warm brown/amber palette.

- Light: cream background (`oklch 0.98`), brown primary (`oklch 0.43`)
- Dark: deep brown background (`oklch 0.18`), warm amber primary (`oklch 0.92`)
- All design must follow this palette — do not introduce colors outside the theme variables.

## Conventions

- **Path alias**: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)
- **Prettier**: 4-space indent, semicolons ON, double quotes — non-standard; run `npm run format` before committing
- **TS strictness**: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` — no explicit `import type` needed
- **No `baseUrl`** in tsconfig — deprecated in TS 6; paths resolve relative to tsconfig location
- **Arrow functions only**: Always use arrow functions (`const fn = () => {}`), never `function` declarations
- **API**: `src/api/api.ts` (axios), base URL from `VITE_API_BASE_URL` env var

## Shadcn CLI Gotchas

- After `npx shadcn@latest add`, files may land literally under `@/components/` — move them to `src/components/ui/`.
- The `@fontsource-variable/geist` import from init is overridden by the caffeine theme's system fonts; remove it if it reappears to avoid needless bundling.
- VS Code schema warning on `components.json` is harmless. `components.json` is the shadcn config file (at project root).
- When adding components from community registries, check for hardcoded import paths that don't match `@/`.

## Layout

```
src/
  api/           # axios instance + interceptors, endpoint constants
  assets/        # static assets
  components/
    common/      # shared custom components
    ui/          # shadcn components (auto-managed by CLI)
  contexts/      # React contexts (auth, theme, etc.)
  hooks/         # custom React hooks
  layouts/       # layout wrapper components
  lib/           # cn() utility, app-wide constants
  pages/         # route-level page components
  types/         # TS type definitions
  App.tsx        # root component
  main.tsx       # entry point
```
