---
name: Big Brew
description: Modern craft coffee POS and operations management for independent shops.
colors:
    warm-cream: "#f4efe8"
    dark-espresso: "#1a0f0a"
    rich-brown: "#4a2512"
    warm-amber: "#c07830"
    warm-white: "#f0ebe3"
    tan-border: "#e2d8cc"
    warm-gray: "#8b7a67"
    pure-white: "#ffffff"
    muted-red: "#c0392b"
    destructive-dark: "#e74c3c"
    chart-green: "#5c8a5c"
    chart-blue: "#3a7ca5"
    admin-bg: "#faf8f5"
    admin-card: "#ffffff"
    admin-border: "#e8e2da"
    admin-text-secondary: "#6b5b4e"
    admin-text-muted: "#756556"
    admin-hover: "#f4efe8"
    admin-sidebar: "#faf7f3"
    admin-sidebar-border: "#ede7df"
    pos-bg: "#faf8f5"
    pos-card: "#ffffff"
    pos-border: "#e8e2da"
    pos-hover: "#f4efe8"
typography:
    display:
        fontFamily: "'Bricolage Grotesque', sans-serif"
        fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
        fontWeight: 600
        lineHeight: 1.15
    headline:
        fontFamily: "'Bricolage Grotesque', sans-serif"
        fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)"
        fontWeight: 500
        lineHeight: 1.2
    title:
        fontFamily: "'Bricolage Grotesque', sans-serif"
        fontSize: "1rem"
        fontWeight: 500
        lineHeight: 1.25
    body:
        fontFamily: "'Bricolage Grotesque', sans-serif"
        fontSize: "0.875rem"
        fontWeight: 400
        lineHeight: 1.5
    label:
        fontFamily: "'Bricolage Grotesque', sans-serif"
        fontSize: "0.8125rem"
        fontWeight: 450
        lineHeight: 1.4
    mono:
        fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace"
        fontSize: "0.875rem"
        fontWeight: 400
        lineHeight: 1.4
rounded:
    sm: "0.3rem"
    md: "0.4rem"
    lg: "0.5rem"
    xl: "0.7rem"
    2xl: "0.9rem"
    3xl: "1.1rem"
    4xl: "1.3rem"
spacing:
    xs: "2px"
    sm: "4px"
    md: "8px"
    lg: "12px"
    xl: "16px"
    2xl: "24px"
    3xl: "32px"
components:
    button-default:
        backgroundColor: "{colors.rich-brown}"
        textColor: "{colors.pure-white}"
        rounded: "{rounded.lg}"
        padding: "6px 10px"
        height: "32px"
    button-default-hover:
        backgroundColor: "{colors.rich-brown}"
        textColor: "{colors.pure-white}"
        opacity: 0.8
        rounded: "{rounded.lg}"
        height: "32px"
    button-outline:
        backgroundColor: "{colors.warm-cream}"
        textColor: "{colors.dark-espresso}"
        rounded: "{rounded.lg}"
        border: "1px solid {colors.tan-border}"
        height: "32px"
    button-secondary:
        backgroundColor: "{colors.warm-white}"
        textColor: "{colors.rich-brown}"
        rounded: "{rounded.lg}"
        height: "32px"
    button-ghost:
        backgroundColor: "transparent"
        textColor: "{colors.dark-espresso}"
        rounded: "{rounded.lg}"
        height: "32px"
    button-destructive:
        backgroundColor: "#c0392b20"
        textColor: "{colors.muted-red}"
        rounded: "{rounded.lg}"
        height: "32px"
    card-default:
        backgroundColor: "{colors.pure-white}"
        rounded: "{rounded.xl}"
        padding: "16px"
    card-default-ring:
        ring: "1px solid oklch(0 0 0 / 0.1)"
    input-default:
        backgroundColor: "transparent"
        border: "1px solid {colors.tan-border}"
        rounded: "{rounded.xl}"
        height: "32px"
        padding: "4px 10px"
    input-focus:
        border: "1px solid {colors.rich-brown}"
        rounded: "{rounded.xl}"
        height: "32px"
---

# Design System: Big Brew

## 1. Overview

**Creative North Star: "Neighborhood Counter"**

This system is the counter where orders happen — welcoming, tactile, unpretentious. The visual identity evokes an independent craft coffee shop: warm earth tones, honest materials, confident simplicity. Every pixel serves the barista or manager under real time pressure; there is nothing decorative for its own sake.

The design is warm without being cute, grounded without being heavy, efficient without being cold. Surfaces use soft tonal layering rather than shadows for depth. Interactive elements feel tactile and confident — solid backgrounds, clear hover states, responsive press effects. The single-typeface approach (Bricolage Grotesque for everything) keeps noise low and legibility high. DM Mono is reserved for prices and tabular data, where exact alignment matters.

**Key Characteristics:**

- Warm earth-tone palette: cream backgrounds, rich brown primaries, amber accents
- Single sans-serif typeface (Bricolage Grotesque) with mono for tabular numbers
- Tonal layering instead of drop shadows for surface hierarchy
- Gem-like border radii (8px default, scaling from 5px to 21px)
- Grain texture overlay for tactile depth without decoration
- Touch-first POS with large targets; mouse-friendly admin in the same system

## 2. Colors: The Neighborhood Palette

A restrained warm earth palette. Creams and browns carry the surface; amber provides the only accent. Color is used to communicate hierarchy, not to decorate.

### Primary

- **Rich Brown** (`#4a2512`): Primary actions, active nav items, headings, focus rings. The anchor of the system.
- **Dark Espresso** (`#1a0f0a`): Body text, foreground on light surfaces. Near-black with a warm brown undertone.

### Accent

- **Warm Amber** (`#c07830`): The only accent color. Used for highlights, CTAs, badges, urgent indicators, chart data. Appears on <10% of any given screen; its rarity is the point.
- **Amber Dark** (`#c07830`): Same value in both themes — invariant across light and dark modes.

### Neutral

- **Warm Cream** (`#f4efe8`): Page background, light mode canvas. A true warm neutral.
- **Warm White** (`#f0ebe3`): Secondary surfaces, sidebar backgrounds.
- **Tan Border** (`#e2d8cc`): Borders, dividers, muted surfaces.
- **Warm Gray** (`#8b7a67`): Secondary text, muted-foreground, placeholder text.
- **Pure White** (`#ffffff`): Cards, popovers, dialogs.

### Semantic

- **Muted Red** (`#c0392b` light / `#e74c3c` dark): Destructive actions, errors, voided orders.

### Named Rules

**The One Voice Rule.** Amber (`#c07830`) is the only accent. It never competes with a second accent color. Any element that needs emphasis draws from this single source.

**The Cream Canvas Rule.** The page background (`#f4efe8`) is the warm anchor. Cards sit white on top; the contrast between cream canvas and white card creates depth without shadows. Do not tint the canvas toward beige or sand — this cream is the committed choice.

## 3. Typography

**Display & Body Font:** Bricolage Grotesque (variable, loaded via `@fontsource-variable/bricolage-grotesque`)
**Mono Font:** DM Mono (weights 400, 500, loaded via `@fontsource/dm-mono`)

**Character:** A single warm geometric sans-serif across all roles keeps the interface calm and legible. Bricolage Grotesque has enough personality in its curves (open apertures, slightly squared bowls) to feel distinctive without being distracting. DM Mono provides a crisp counterpoint for prices, order numbers, and tabular data — its consistent character widths make columns scan quickly.

### Hierarchy

- **Display** (semibold 600, `clamp(1.5rem, 3vw, 2.25rem)`, 1.15 line-height): Page titles, dashboard headings, large order IDs. `text-wrap: balance`.
- **Headline** (medium 500, `clamp(1.125rem, 2.5vw, 1.5rem)`, 1.2 line-height): Section headings, dialog titles. `text-wrap: balance`.
- **Title** (medium 500, `1rem/16px`, 1.25 line-height): Card titles, panel headers, list item titles.
- **Body** (normal 400, `0.875rem/14px`, 1.5 line-height): Default reading text, descriptions, table cells.
- **Label** (450 weight, `0.8125rem/13px`, 1.4 line-height): Form labels, metadata, secondary info, field hints.
- **Mono** (normal 400, `0.875rem/14px`, 1.4 line-height): Prices, order IDs, tabular figures, ingredient quantities, codes. Uses `font-variant-numeric: tabular-nums`.

### Named Rules

**The Mono-for-Data Rule.** Any displayed price, quantity, order ID, or code uses DM Mono with tabular numerals. This is non-negotiable — it ensures columns of numbers align vertically for quick scanning.

## 4. Elevation

The system uses tonal layering for depth, not drop shadows. A card on the cream canvas is `#ffffff` — that contrast alone creates the surface hierarchy. Modals and dialogs are centered overlays with a `rgba(0,0,0,0.12)` backdrop blur. Surfaces are flat at rest.

Shadows exist but are reserved for state-driven interactions: button press scale, focus rings, and the charge-ready payment pulse. The shadow vocabulary is deliberately flat — all levels share `3px` blur and `1px` offset — because hierarchy comes from background color, not shadow drama.

The admin theme uses a lighter cream canvas (`--admin-bg: #faf8f5`, `--admin-card: #ffffff`) with a subtle border (`--admin-border: #e8e2da`) for card distinction, maintaining the same tonal-layering philosophy with slightly cooler values for the more data-dense context.

### Named Rules

**The Flat-by-Default Rule.** Surfaces have no resting shadows. Hierarchy comes from background color (cream canvas → white card → dark modal backdrop). Shadows appear only as state responses: hover lifts, focus rings, press depresses.

## 5. Components

All components use Tailwind CSS with semantic tokens only (`bg-card`, `text-muted-foreground`, `border-border`). No raw color values in component code.

### Buttons

Buttons are tactile and confident — solid backgrounds, responsive press effects, clear focus rings. All variants use Bricolage Grotesque at `text-sm` (`0.875rem`, weight 500).

- **Shape:** Fully rounded (`rounded-lg`, 8px default). Borderless by default (border applied as `border-transparent` for consistent box model).
- **Primary (`bg-primary text-primary-foreground`):** Rich brown (`#4a2512`) background, white text. The workhorse button for confirm, save, submit actions. Hover reduces opacity to 80%.
- **Outline (`border-border bg-background`):** Tan border on cream background. For secondary actions, cancels, and dismissals. Hover fills with muted bg.
- **Secondary (`bg-secondary text-secondary-foreground`):** Warm white (`#f0ebe3`) background, rich brown text. For grouped actions and toolbars.
- **Ghost (`hover:bg-muted`):** No border, no background at rest. For inline actions and navigation links. Hover fills with tan muted.
- **Destructive (`bg-destructive/10 text-destructive`):** 10% tint of muted red on transparent, red text. For delete and void actions.
- **Link (`text-primary underline-offset-4`):** Text-only with underline on hover. For navigation within forms.
- **Sizes:** `xs` (24px), `sm` (28px), `default` (32px), `lg` (36px), `icon` (32px square), `icon-xs/sm/lg`. All sizes share the same 8px radius except xs/sm icon which use a computed smaller radius.
- **Icon placement:** `data-icon="inline-start"` / `data-icon="inline-end"` on the button. Phosphor icons at 16px within buttons.
- **States:** Hover transitions all properties 150ms. Focus-visible shows `2px ring` at `--ring` color with 50% opacity. Active translates the button down 1px (`.active:translate-y-px`). Disabled reduces to 50% opacity with no pointer events.

### Cards

Cards are white containers on the cream canvas with a `1px` ring at `oklch(0 0 0 / 0.1)` for subtle distinction.

- **Corner Style:** `rounded-xl` (11px computed from 0.5rem × 1.4). Uniform on all corners.
- **Background:** `bg-card` (`#ffffff`). No shadow at rest.
- **Internal Spacing:** `--card-spacing` variable set to `16px` (default) or `12px` (sm variant).
- **Sections:** Header (optional: title + description + action), Content, Footer (optional: bordered top, muted background).
- **Header layout:** Title on the left, optional Action on the right. Description below title when present.

### Dialogs

Modals use the native `<dialog>`-based `@base-ui/react/dialog` primitives with Portal rendering.

- **Overlay:** Fixed fullscreen, `rgba(0,0,0,0.12)` black, with `backdrop-filter: blur(4px)` when the browser supports it. Fades in/out over 100ms.
- **Content:** Centered card (`position: fixed, top/left 50%, -translate-50%`), white background, `rounded-xl` (11px), `1px` ring at 10% foreground. Zooms in 95→100% on open; reverse on close.
- **Close button:** Ghost icon button at top-right (unless `showCloseButton={false}`).
- **Footer:** Optional, bordered top, muted background. Placed below the content.

### Inputs

Input fields are border-stroke with a transparent background and generous corner radius.

- **Style:** `1px` solid `--input` border (`#e2d8cc`), transparent background, `rounded-xl` (11px), 32px height, 10px horizontal padding.
- **Focus:** Border shifts to `--ring` (`#4a2512`), adds `2px ring` at 50% ring color.
- **Error:** Border shifts to `--destructive`, destructive-tinted ring.
- **Disabled:** 50% opacity of input background, cursor not-allowed, 50% opacity text.
- **Placeholder:** `--muted-foreground` (`#8b7a67`) at full opacity (4.5:1 minimum contrast).

### Navigation

- **POS sidebar:** Warm white background, muted text for inactive items, rich brown for active. Active item gets a subtle background tint (`--hover: #f4efe8`). The sidebar lives on the right side of the POS layout.
- **Admin sidebar:** Left-aligned navigation in the admin dashboard. Uses `--admin-sidebar` (`#faf7f3`) background with `1px` right border. Similar active/hover pattern with the admin palette's lighter values.
- **Admin nav items:** 32px height, color transitions on hover (150ms), active state carries weight 500 alongside the color change.

### Distinctive Custom Components

**POS Menu Grid:** A 4-column responsive grid of menu item cards. Each card shows an image (or placeholder with steam animation), item name, and price. Cards are flat with a `1px` border at rest, gaining a border color shift on hover. Category tabs at the top switch the grid content.

**POS Cart Panel:** A sidebar on the POS showing the current order. Line items with name, modifiers, quantity controls, and running total. Bottom has a summary bar with total and action buttons.

## 6. Do's and Don'ts

### Do:

- **Do** use `gap-*` for spacing. Never `space-y-*`.
- **Do** use semantic tokens only — no raw color classes (`bg-blue-500`, `text-gray-700`).
- **Do** keep body text at 4.5:1 minimum contrast against its background. The `#1a0f0a` foreground on `#f4efe8` cream achieves 13.6:1.
- **Do** use DM Mono with `tabular-nums` for all prices, quantities, and order IDs.
- **Do** use the grain overlay (`grain-overlay` class) on full-page backgrounds for tactile depth.
- **Do** respect `prefers-reduced-motion` — animations degrade gracefully to instant transitions.
- **Do** set large touch targets (minimum 44px) on all POS interactive elements.
- **Do** keep the accent (amber) to <10% of any given screen.
- **Do** use Bricolage Grotesque for all UI copy. No second sans-serif face.

### Don't:

- **Don't** use decorative shadows. Hierarchy comes from background color layering, not box-shadow.
- **Don't** use glassmorphism, gradient text, or heavy blur effects. Surfaces are solid and honest.
- **Don't** use a dark theme as default. The default is light (warm cream). Dark mode is opt-in via `.dark` class on `<html>`.
- **Don't** introduce a second accent color. Amber is the single point of emphasis.
- **Don't** use bright primary colors (reds, yellows, blues) — the palette is restrained earth tones.
- **Don't** use the fast-food aesthetic: no glossy surfaces, no neon, no aggressive gradients.
- **Don't** style placeholder text as muted gray. Use `#8b7a67` (4.5:1 contrast) or darker.
- **Don't** place shadows on cards at rest. Cards are distinguished from the canvas by their white background alone.
- **Don't** use `space-y-*` for vertical rhythm. Use `flex flex-col gap-*` consistently.
