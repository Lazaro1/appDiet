---
version: "1.0"
name: AppDiet-design-system
description: A warm, encouraging mobile-first nutrition app design system anchored on warm-white canvas, teal primary actions, and orange accent moments for food and energy. Typography runs Plus Jakarta Sans at approachable weights — friendly without being childish. The system prioritizes clarity over decoration: every element serves the patient's goal of understanding their diet progress at a glance.

colors:
  # --- Primary ---
  primary: "#0d9488"
  primary-hover: "#0f766e"
  primary-active: "#115e59"
  primary-soft: "#ccfbf1"
  primary-subtle: "#f0fdfa"

  # --- Ink & Text ---
  ink: "#1c1917"
  body: "#44403c"
  muted: "#78716c"
  hint: "#a8a29e"

  # --- Surfaces ---
  canvas: "#fffbf7"
  surface: "#f5f0eb"
  surface-raised: "#ede8e2"
  surface-overlay: "rgba(28, 25, 23, 0.5)"
  surface-dark: "#1c1917"
  surface-dark-elevated: "#292524"

  # --- Accent Warm (food / energy / encouragement) ---
  accent-warm: "#f97316"
  accent-warm-soft: "#fff7ed"
  accent-warm-hover: "#ea580c"

  # --- Accent Green (success / on-track) ---
  accent-green: "#22c55e"
  accent-green-soft: "#f0fdf4"

  # --- Semantic ---
  success: "#16a34a"
  success-soft: "#dcfce7"
  warning: "#eab308"
  warning-soft: "#fefce8"
  danger: "#ef4444"
  danger-soft: "#fef2f2"
  info: "#0d9488"
  info-soft: "#ccfbf1"

  # --- Signature Card Surfaces ---
  signature-teal: "#0d9488"
  signature-warm: "#f97316"
  signature-cream: "#fef3c7"
  signature-peach: "#fed7aa"
  signature-sage: "#d9f99d"

  # --- Borders ---
  border: "#e7e5e4"
  border-strong: "#d6d3d1"
  border-focus: "#0d9488"

  # --- On colors ---
  on-primary: "#ffffff"
  on-dark: "#fafaf9"
  on-warm: "#1c1917"

typography:
  # --- Display (Dashboard hero numbers, big stats) ---
  display-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  display-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  display-sm:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0

  # --- Titles (Section headings, card titles) ---
  title-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  title-sm:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0

  # --- Body (Running text, descriptions) ---
  body-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0

  # --- Labels & Captions ---
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0.04em
  caption:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.02em

  # --- Numeric (Calorie displays, stats) ---
  stat-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.03em
  stat-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  stat-sm:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em

  # --- Button ---
  button-lg:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: 0
  button-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: 0
  button-sm:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: 0

rounded:
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  section: 64px

shadows:
  xs: "0 1px 2px rgba(28, 25, 23, 0.04)"
  sm: "0 2px 4px rgba(28, 25, 23, 0.06)"
  md: "0 4px 12px rgba(28, 25, 23, 0.08)"
  lg: "0 8px 24px rgba(28, 25, 23, 0.12)"
  xl: "0 16px 48px rgba(28, 25, 23, 0.16)"

components:
  # --- Navigation ---
  bottom-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    activeTextColor: "{colors.primary}"
    activeIconColor: "{colors.primary}"
    typography: "{typography.caption}"
    height: 64px
    shadow: "{shadows.sm}"
    items:
      - icon: home
        label: Início
        route: /
      - icon: utensils
        label: Refeições
        route: /meals
      - icon: message-circle
        label: Chat
        route: /chat
      - icon: bar-chart-3
        label: Progresso
        route: /progress
      - icon: user
        label: Perfil
        route: /profile

  # --- Buttons ---
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    shadow: "{shadows.xs}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-primary-soft:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    border: "1px solid {colors.border-strong}"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border-strong}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
  button-icon:
    backgroundColor: transparent
    textColor: "{colors.body}"
    rounded: "{rounded.full}"
    size: 40px
  button-icon-primary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 40px

  # --- Cards ---
  meal-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "{shadows.sm}"
    border: "1px solid {colors.border}"
  meal-card-eaten:
    backgroundColor: "{colors.accent-green-soft}"
    border: "1px solid {colors.success}"
    borderLeft: "4px solid {colors.success}"
  meal-card-skipped:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    borderLeft: "4px solid {colors.muted}"
  meal-card-pending:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.primary}"
    borderLeft: "4px solid {colors.primary}"
  meal-card-out-of-window:
    backgroundColor: "{colors.warning-soft}"
    border: "1px solid {colors.warning}"
    borderLeft: "4px solid {colors.warning}"

  diet-review-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    shadow: "{shadows.sm}"
    border: "1px solid {colors.border}"

  stat-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    shadow: "{shadows.xs}"
    border: "1px solid {colors.border}"

  # --- Progress ---
  calorie-bar:
    trackColor: "{colors.surface-raised}"
    fillColor: "{colors.primary}"
    overColor: "{colors.accent-warm}"
    height: 12px
    rounded: "{rounded.full}"
    typography: "{typography.stat-sm}"

  progress-ring:
    trackColor: "{colors.surface-raised}"
    fillColor: "{colors.primary}"
    size: 120px
    strokeWidth: 10px
    typography: "{typography.stat-md}"

  # --- Chat ---
  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    borderBottomRightRadius: "{rounded.xs}"
    padding: "{spacing.sm} {spacing.md}"
    maxWidth: 80%
  chat-bubble-assistant:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    borderBottomLeftRadius: "{rounded.xs}"
    padding: "{spacing.sm} {spacing.md}"
    maxWidth: 80%
  chat-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.border}"
    minHeight: 48px

  # --- Onboarding ---
  onboarding-step:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  onboarding-stepper:
    activeColor: "{colors.primary}"
    completedColor: "{colors.primary}"
    inactiveColor: "{colors.border}"
    size: 8px
    spacing: "{spacing.xs}"

  # --- Bottom Sheet ---
  bottom-sheet:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl} {rounded.xl} 0 0"
    shadow: "{shadows.xl}"
    padding: "{spacing.lg}"
    maxHeight: 85vh
  bottom-sheet-handle:
    backgroundColor: "{colors.border-strong}"
    width: 36px
    height: 4px
    rounded: "{rounded.full}"

  # --- Floating Action ---
  fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
    shadow: "{shadows.lg}"
    iconSize: 24px

  # --- Badges ---
  badge-pending:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-eaten:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-skipped:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"

  # --- Inputs ---
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: 48px
    border: "1px solid {colors.border}"
  text-input-focus:
    border: "2px solid {colors.border-focus}"
    shadow: "0 0 0 3px {colors.primary-soft}"
  text-input-error:
    border: "1px solid {colors.danger}"
    textColor: "{colors.danger}"

  # --- Signature Surfaces ---
  signature-teal-card:
    backgroundColor: "{colors.signature-teal}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  signature-warm-card:
    backgroundColor: "{colors.signature-warm}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  signature-cream-card:
    backgroundColor: "{colors.signature-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"

  # --- Weight ---
  weight-chart:
    lineColor: "{colors.primary}"
    dotColor: "{colors.primary}"
    gridColor: "{colors.border}"
    labelColor: "{colors.muted}"
    typography: "{typography.caption}"

  # --- Swap ---
  swap-suggestion-card:
    backgroundColor: "{colors.accent-warm-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    border: "1px solid {colors.accent-warm}"
---

## Overview

AppDiet's visual identity is **warm, clear, and encouraging** — designed for patients tracking meals on their phones, often in a hurry. The system avoids clinical coldness and punitive aesthetics; instead it uses warm whites, teal primary actions, and orange accent moments that evoke food and energy without being childish.

**Key Characteristics:**

- **Primary action is teal** (`{colors.primary}` — #0d9488): confident, fresh, modern. Used for all primary buttons, active navigation, progress fills, and links. Never used as a background surface — it's reserved for interactive elements and emphasis.
- **Warm accent is orange** (`{colors.accent-warm}` — #f97316): appears on food-related moments — swap suggestions, calorie-over indicators, encouragement callouts. It's the "energy" color, used sparingly so it retains impact.
- **Canvas is warm white** (`{colors.canvas}` — #fffbf7): not pure white. The slight warm tint prevents the clinical feel of pure #ffffff and makes the app feel approachable, like a kitchen rather than a hospital.
- **Surface is warm gray** (`{colors.surface}` — #f5f0eb): cards and raised areas sit on this warm gray, creating gentle depth without harsh shadows.
- **Stat typography is heavy** (`{typography.stat-lg}` at 800 weight): calorie numbers and progress percentages are the hero moments of the app. They use extra-bold weight and tight tracking to feel decisive and motivating.
- **Body typography is light** (`{typography.body-md}` at 400 weight): running text stays at regular weight. The system reserves 600+ for titles, buttons, and labels — never for paragraphs.
- **Border-left on meal cards** encodes status at a glance: teal for pending, green for eaten, muted for skipped, yellow for out-of-window. The patient sees their day's status before reading any text.
- **Mobile-first, always**: bottom navigation, bottom sheets for secondary actions, 48px touch targets, generous padding. Desktop gets a sidebar but the layout never assumes more than 390px of width.
- **Encouragement over punishment**: success states use `{colors.accent-green-soft}` backgrounds; "off track" states use `{colors.warning-soft}` (soft yellow, never red). The only red (`{colors.danger}`) is for destructive actions like deleting a diet, never for dietary choices.

## Colors

### Primary

- **Primary** (`{colors.primary}` — #0d9488): The dominant interactive color. All primary buttons, active nav items, progress bar fills, links, and focus rings. Teal reads as fresh, health-adjacent, and modern — distinct from the generic blue of most SaaS apps.
- **Primary Hover** (`{colors.primary-hover}` — #0f766e): Hover state on primary buttons. Darkens slightly.
- **Primary Active** (`{colors.primary-active}` — #115e59): Press/active state. Darker still for clear tactile feedback.
- **Primary Soft** (`{colors.primary-soft}` — #ccfbf1): Light teal background for badges, subtle highlights, and selected states. Never used for large surface areas.
- **Primary Subtle** (`{colors.primary-subtle}` — #f0fdfa): Even lighter teal for hover backgrounds on soft buttons.

### Ink & Text

- **Ink** (`{colors.ink}` — #1c1917): The strongest text — titles, stat numbers, primary button text on light. Warm black, not pure black.
- **Body** (`{colors.body}` — #44403c): Default running text. Warm dark gray that reads comfortably on warm white.
- **Muted** (`{colors.muted}` — #78716c): Secondary text — captions, timestamps, inactive nav items, helper text.
- **Hint** (`{colors.hint}` — #a8a29e): Placeholder text in inputs, disabled labels. The lightest readable text on canvas.

### Surfaces

- **Canvas** (`{colors.canvas}` — #fffbf7): The default page background. Warm white — the floor of every screen. Not pure white, which reads as clinical.
- **Surface** (`{colors.surface}` — #f5f0eb): Card backgrounds, raised areas, chat bubbles (assistant). Warm light gray.
- **Surface Raised** (`{colors.surface-raised}` — #ede8e2): Hover states on cards, progress bar tracks, dividers that need more presence than a border.
- **Surface Overlay** (`{colors.surface-overlay}` — rgba(28, 25, 23, 0.5)): Bottom sheet backdrop, modal overlay.
- **Surface Dark** (`{colors.surface-dark}` — #1c1917): Dark mode base (future). Same as ink — the system reuses ink as the dark surface.
- **Surface Dark Elevated** (`{colors.surface-dark-elevated}` — #292524): Cards on dark mode (future).

### Accent Warm (Food / Energy / Encouragement)

- **Accent Warm** (`{colors.accent-warm}` — #f97316): Orange. Used for food-related callouts — swap suggestions, calorie-over indicators, "you ate this" highlights. Appears sparingly so it retains impact.
- **Accent Warm Soft** (`{colors.accent-warm-soft}` — #fff7ed): Light orange background for swap suggestion cards and food highlights.
- **Accent Warm Hover** (`{colors.accent-warm-hover}` — #ea580c): Press state on warm accent buttons.

### Accent Green (Success / On-Track)

- **Accent Green** (`{colors.accent-green}` — #22c55e): Used for "on track" indicators — conformant meals, weekly deficit achieved, weight loss progress. Always paired with the soft variant for backgrounds.
- **Accent Green Soft** (`{colors.accent-green-soft}` — #f0fdf4): Background for success states on meal cards and progress indicators.

### Semantic

- **Success** (`{colors.success}` — #16a34a): Confirmation toasts, "diet activated" banners. Slightly darker than accent-green for text readability.
- **Success Soft** (`{colors.success-soft}` — #dcfce7): Background for success banners.
- **Warning** (`{colors.warning}` — #eab308): "Almost off track" states, out-of-window meals, mild calorie overshoot. Yellow, not red — the system doesn't alarm.
- **Warning Soft** (`{colors.warning-soft}` — #fefce8): Background for warning states.
- **Danger** (`{colors.danger}` — #ef4444): Destructive actions only — deleting a diet, removing account. Never used for dietary choices or "you ate too much" messaging.
- **Danger Soft** (`{colors.danger-soft}` — #fef2f2): Background for destructive confirmation dialogs.
- **Info** (`{colors.info}` — #0d9488): Same as primary — the system uses teal for both interactive and informational purposes.

### Signature Card Surfaces

These carry the brand's emotional voltage. They appear as full-bleed or near-full-bleed cards that punctuate the dashboard and onboarding:

- **Signature Teal** (`{colors.signature-teal}` — #0d9488): The "you're on track" hero card. Full-bleed teal with white text. Used for the weekly progress summary card on the dashboard.
- **Signature Warm** (`{colors.signature-warm}` — #f97316): The "swap available" or "meal logged" celebration card. Orange with white text. Used sparingly for moments of achievement.
- **Signature Cream** (`{colors.signature-cream}` — #fef3c7): The encouragement callout. Warm yellow with dark text. Used for contextual tips like "Sua semana está em déficit de 1.200 kcal!".
- **Signature Peach** (`{colors.signature-peach}` — #fed7aa): Food item highlights and meal card accents.
- **Signature Sage** (`{colors.signature-sage}` — #d9f99d): The "green choice" indicator for conformant meals.

### Borders

- **Border** (`{colors.border}` — #e7e5e4): Default 1px borders on cards, inputs, dividers. Warm light gray.
- **Border Strong** (`{colors.border-strong}` — #d6d3d1): Secondary button outlines, disabled states, bottom sheet handles.
- **Border Focus** (`{colors.border-focus}` — #0d9488): Focus ring color on inputs and buttons. Matches primary.

## Typography

### Font Family

**Plus Jakarta Sans** is the sole typeface. It's geometric, friendly, and highly legible at mobile sizes — the rounded terminals feel approachable without being playful. The weight range (400–800) provides clear hierarchy without needing a second typeface.

Fallback stack: `Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-lg}` | 32px | 700 | 1.15 | -0.02em | Dashboard hero stat ("1.847 kcal") |
| `{typography.display-md}` | 28px | 700 | 1.2 | -0.01em | Section hero numbers, onboarding titles |
| `{typography.display-sm}` | 24px | 600 | 1.25 | 0 | Card titles, meal plan headings |
| `{typography.title-lg}` | 20px | 600 | 1.3 | 0 | Meal card titles, wizard step headings |
| `{typography.title-md}` | 18px | 600 | 1.35 | 0 | Sub-section titles, bottom sheet headers |
| `{typography.title-sm}` | 16px | 600 | 1.4 | 0 | List item titles, badge labels |
| `{typography.body-lg}` | 16px | 500 | 1.5 | 0 | Important body text, onboarding descriptions |
| `{typography.body-md}` | 14px | 400 | 1.5 | 0 | Default running text, chat messages |
| `{typography.body-sm}` | 13px | 400 | 1.45 | 0 | Secondary descriptions, helper text |
| `{typography.label}` | 12px | 600 | 1.35 | 0.04em | Status badges, nav labels, form labels (uppercase not required) |
| `{typography.caption}` | 11px | 500 | 1.3 | 0.02em | Timestamps, fine print, meta text |
| `{typography.stat-lg}` | 36px | 800 | 1 | -0.03em | Dashboard calorie total, weekly deficit |
| `{typography.stat-md}` | 28px | 700 | 1.05 | -0.02em | Meal kcal target, progress percentage |
| `{typography.stat-sm}` | 20px | 700 | 1.1 | -0.01em | Inline stats, badge numbers |
| `{typography.button-lg}` | 16px | 600 | 1.375 | 0 | Primary CTA buttons, onboarding "Continuar" |
| `{typography.button-md}` | 14px | 600 | 1.375 | 0 | Default buttons, chat send |
| `{typography.button-sm}` | 13px | 600 | 1.375 | 0 | Secondary actions, swap buttons, inline actions |

### Principles

1. **Stats are heroes.** Calorie numbers, progress percentages, and weekly deficits use `{typography.stat-lg}` or `{typography.stat-md}` with tight tracking. These are the first thing the patient sees — they must feel decisive.
2. **Weight 400 for body, 600+ for structure.** Running text is always 400. Titles, labels, and buttons are 600. The only 700/800 is for stats and display headings. Never use 400 for a heading or 600 for a paragraph.
3. **Negative tracking on large numbers.** `{typography.stat-lg}` uses -0.03em letter-spacing. This tightens large calorie numbers so they feel compact and confident, not spread out.
4. **One typeface, no exceptions.** Plus Jakarta Sans covers everything from 11px captions to 36px hero stats. No secondary font, no monospace for numbers (Plus Jakarta Sans tabular figures handle alignment).

## Layout

### Spacing System

- **Base unit:** 4px. All spacing snaps to 4px multiples.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 20px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.xxxl}` 48px · `{spacing.section}` 64px.
- **Mobile horizontal padding:** `{spacing.md}` (16px) on every screen. Content never touches the edge.
- **Card internal padding:** `{spacing.md}` (16px) for meal cards and stat cards; `{spacing.lg}` (20px) for diet review cards; `{spacing.xl}` (24px) for signature cards.
- **Section gaps:** `{spacing.xl}` (24px) between sections on mobile; `{spacing.xxl}` (32px) on desktop.
- **Bottom nav safe area:** 64px bottom nav + 16px padding above content that scrolls behind it.

### Grid & Container

- **Mobile:** Single column, full width with 16px horizontal margins. No grid system needed.
- **Desktop (≥1024px):** Max content width 480px centered (the app feels like a phone even on desktop). Alternatively, a two-column layout with sidebar navigation (280px) + content area.
- **Dashboard:** Vertical stack of cards. No multi-column grid on mobile. On desktop, stat cards can form a 2×2 grid.

### Whitespace Philosophy

AppDiet uses whitespace to reduce cognitive load for patients who are often checking the app quickly between meals. Key principles:

- **Generous vertical rhythm:** 24px between sections on mobile, 32px on desktop. Never crowd sections together.
- **Stat breathing room:** Hero numbers (calorie totals) always have at least 16px of space above and below. They should feel like they float.
- **Card gaps:** 12px between meal cards in a list. Enough to distinguish, not enough to waste vertical space.
- **No decorative whitespace:** Every gap serves readability. No "breathing room" sections that add scroll without content.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Page backgrounds, section dividers |
| Card rest | `{shadows.sm}` + 1px `{colors.border}` | Meal cards, stat cards, diet review cards |
| Card hover | `{shadows.md}` + 1px `{colors.border}` | Interactive cards on hover (desktop only) |
| Raised | `{shadows.md}` | Bottom sheets, dropdown menus |
| Floating | `{shadows.lg}` | FAB, toast notifications |
| Modal | `{shadows.xl}` | Full-screen modals, onboarding overlays |

The elevation philosophy is **warm shadow, subtle depth**. Shadows use warm-tinted rgba values (`rgba(28, 25, 23, ...)`) to match the warm canvas. No blue-tinted shadows. Depth is communicated through shadow + border combination, never shadow alone.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | Small badges, inline tags |
| `{rounded.sm}` | 8px | Input fields, small buttons |
| `{rounded.md}` | 12px | Secondary buttons, text inputs, swap suggestion cards |
| `{rounded.lg}` | 16px | Primary buttons, meal cards, stat cards, chat bubbles |
| `{rounded.xl}` | 20px | Bottom sheets, onboarding step containers, signature cards |
| `{rounded.pill}` | 9999px | Status badges, nav pills, calorie percentage badges |
| `{rounded.full}` | 9999px | Avatar circles, FAB, icon buttons |

### Shape Philosophy

- **Cards are `{rounded.lg}` (16px)** — rounded enough to feel friendly, not so round that they look like bubbles.
- **Buttons are `{rounded.lg}` (16px)** — same radius as cards for visual consistency. The primary button is a solid teal rectangle with rounded corners, not a pill.
- **Chat bubbles are `{rounded.lg}` with one corner reduced to `{rounded.xs}`** — the user bubble has bottom-right sharp; the assistant bubble has bottom-left sharp. This creates a speech-bubble effect without being cartoonish.
- **Bottom sheets are `{rounded.xl}` on top corners only** — the handle sits in the rounded top area, and the bottom is flush with the screen edge.
- **Badges are `{rounded.pill}`** — full pill shape for status badges (Pendente, Registrada, Pulada).

## Components

> **All components target mobile-first.** Desktop adaptations are noted where they differ.

### Navigation

**`bottom-nav`** — Fixed to the bottom of the screen on mobile. 64px tall, `{colors.canvas}` background with `{shadows.sm}` top shadow. Five items: Início, Refeições, Chat, Progresso, Perfil. Active item uses `{colors.primary}` for icon and label; inactive uses `{colors.muted}`. Labels use `{typography.caption}` (11px/500). Icons are 20px stroke icons (Lucide).

- Desktop adaptation: Converts to a 240px left sidebar with icon + label, `{colors.canvas}` background, `{colors.border}` right border. Active item gets a 3px `{colors.primary}` left border indicator.

### Buttons

**`button-primary`** — The main action button. Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button-md}`, padding 14px × 24px, rounded `{rounded.lg}` (16px). Used for "Continuar", "Registrar refeição", "Ativar dieta". One per screen maximum.
- Hover: `{button-primary-hover}` darkens to `{colors.primary-hover}`.
- Active: `{button-primary-active}` darkens to `{colors.primary-active}`.
- Disabled: 50% opacity, no pointer events.

**`button-primary-soft`** — Teal on teal-soft. Background `{colors.primary-soft}`, text `{colors.primary}`. Used for secondary teal actions like "Ver progresso", "Trocar alimento". Same shape as primary.

**`button-secondary`** — Outlined button. Background `{colors.canvas}`, text `{colors.ink}`, 1px border `{colors.border-strong}`. Used for "Pular", "Cancelar", "Editar". Sits next to primary as the less-committed choice.

**`button-danger`** — Red destructive button. Background `{colors.danger}`, text `{colors.on-primary}`. Used only for "Excluir dieta", "Remover conta". Never for dietary feedback.

**`button-icon`** — 40px circular button with transparent background and `{colors.body}` icon. Used for close, back, more options.

**`button-icon-primary`** — 40px circular button with `{colors.primary-soft}` background and `{colors.primary}` icon. Used for positive icon actions like "Registrar peso", "Adicionar refeição".

### Cards & Containers

**`meal-card`** — The most important card in the app. Shows a single meal with its status. Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.md}`, shadow `{shadows.sm}`, 1px border `{colors.border}`. Contains: meal name (`{typography.title-sm}`), time window (`{typography.caption}`), kcal target vs actual (`{typography.stat-sm}`), and a status badge.

- **Status variants** are communicated via a 4px left border:
  - `meal-card-pending`: Teal left border (`{colors.primary}`), white background. "You still need to eat this."
  - `meal-card-eaten`: Green left border (`{colors.success}`), green-soft background (`{colors.accent-green-soft}`). "You ate this and it's on track."
  - `meal-card-skipped`: Muted left border (`{colors.muted}`), surface background (`{colors.surface}`). "You skipped this — no judgment."
  - `meal-card-out-of-window`: Yellow left border (`{colors.warning}`), yellow-soft background (`{colors.warning-soft}`). "You ate this outside the planned window."

**`diet-review-card`** — Shows a full diet plan for review before activation. Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.lg}`, shadow `{shadows.sm}`. Contains: plan name, daily kcal total, list of meals with their kcal targets. Has "Aprovar" (primary) and "Ajustar" (secondary) buttons at bottom.

**`stat-card`** — Small card for dashboard stats. Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.md}`, shadow `{shadows.xs}`, 1px border `{colors.border}`. Contains: a label (`{typography.label}`) and a number (`{typography.stat-md}` or `{typography.stat-sm}`).

### Progress Indicators

**`calorie-bar`** — Horizontal progress bar showing daily calorie consumption vs target. Track color `{colors.surface-raised}`, fill color `{colors.primary}`, height 12px, rounded `{rounded.full}`. When over target, fill switches to `{colors.accent-warm}`. Below the bar: "{stat-sm} kcal restantes" in `{typography.stat-sm}`.

- Weekly variant: Same bar but wider, showing weekly deficit/surplus. Fill is `{colors.primary}` for deficit, `{colors.accent-warm}` for surplus.

**`progress-ring`** — Circular SVG progress indicator for adherence percentage. 120px diameter, 10px stroke width. Track `{colors.surface-raised}`, fill `{colors.primary}`. Center shows percentage in `{typography.stat-md}`. Used for weekly adherence metric.

### Chat

**`chat-bubble-user`** — User messages. Background `{colors.primary}`, text `{colors.on-primary}`, rounded `{rounded.lg}` with bottom-right corner `{rounded.xs}` (speech bubble effect). Max width 80%. Padding `{spacing.sm}` × `{spacing.md}`.

**`chat-bubble-assistant`** — AI messages. Background `{colors.surface}`, text `{colors.ink}`, rounded `{rounded.lg}` with bottom-left corner `{rounded.xs}`. Max width 80%. Same padding.

**`chat-input`** — Fixed to bottom of chat screen. Background `{colors.canvas}`, text `{colors.ink}`, rounded `{rounded.xl}`, min height 48px, 1px border `{colors.border}`. Expands vertically as text grows. Send button is `{button-icon-primary}` inside the input.

### Onboarding

**`onboarding-step`** — Full-screen form step. Background `{colors.canvas}`, rounded `{rounded.xl}`, padding `{spacing.xl}`. Each step has: a step title (`{typography.title-lg}`), a description (`{typography.body-md}`), form inputs, and "Continuar" / "Voltar" buttons.

**`onboarding-stepper`** — Horizontal dots at the top of each step. Active dot: `{colors.primary}` 8px circle. Completed dot: `{colors.primary}` 8px circle with a checkmark. Inactive dot: `{colors.border}` 8px circle. Spacing `{spacing.xs}` between dots.

### Bottom Sheet

**`bottom-sheet`** — Slides up from bottom. Background `{colors.canvas}`, top corners rounded `{rounded.xl}`, shadow `{shadows.xl}`, padding `{spacing.lg}`, max height 85vh. Contains a drag handle at top center: 36px × 4px pill in `{colors.border-strong}`.

- Used for: swap suggestions, meal detail view, weight entry, confirmation dialogs.
- Desktop adaptation: Renders as a centered modal dialog instead, with all corners rounded `{rounded.xl}`.

### Floating Action Button

**`fab`** — Fixed to bottom-right, 16px above bottom nav. Background `{colors.primary}`, icon `{colors.on-primary}`, 56px circle, shadow `{shadows.lg}`. Used for "Registrar refeição" quick action on the dashboard.

### Badges

**`badge-pending`** — Teal pill. Background `{colors.primary-soft}`, text `{colors.primary}`. Label: "Pendente".

**`badge-eaten`** — Green pill. Background `{colors.success-soft}`, text `{colors.success}`. Label: "Registrada".

**`badge-skipped`** — Gray pill. Background `{colors.surface-raised}`, text `{colors.muted}`. Label: "Pulada".

**`badge-warning`** — Yellow pill. Background `{colors.warning-soft}`, text `{colors.warning}`. Label: "Fora da janela" or "Acima da meta".

### Inputs

**`text-input`** — Standard input. Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, rounded `{rounded.md}`, padding 12px × 16px, height 48px, 1px border `{colors.border}`.

- **Focus:** Border becomes 2px `{colors.border-focus}` with 3px `{colors.primary-soft}` outer ring.
- **Error:** Border becomes 1px `{colors.danger}`, text becomes `{colors.danger}`.
- **Disabled:** Background `{colors.surface}`, text `{colors.hint}`, 1px border `{colors.border}`.

### Signature Surfaces

**`signature-teal-card`** — Full-bleed or near-full-bleed card for the weekly progress summary. Background `{colors.signature-teal}`, text `{colors.on-primary}`, rounded `{rounded.lg}`, padding `{spacing.xl}`. Contains: a headline like "Sua semana está em déficit!" in `{typography.title-lg}`, a stat in `{typography.stat-md}`, and a contextual message in `{typography.body-md}`.

**`signature-warm-card`** — Celebration card for meal logging achievements. Background `{colors.signature-warm}`, text `{colors.on-primary}`, same shape. Used sparingly — maybe once per day when the patient hits 100% adherence.

**`signature-cream-card`** — Encouragement callout. Background `{colors.signature-cream}`, text `{colors.ink}`, rounded `{rounded.lg}`, padding `{spacing.lg}`. Used for contextual tips: "Dica: beber água antes da refeição ajuda na saciedade!".

### Weight Chart

**`weight-chart`** — Simple line chart (Recharts or similar). Line color `{colors.primary}`, dot color `{colors.primary}`, grid lines `{colors.grid}`, axis labels `{typography.caption}` in `{colors.muted}`. 7-day and 30-day views. No fill under the line — clean and minimal.

## States

### Meal Status

| Status | Card Variant | Badge | Left Border | Background |
|---|---|---|---|---|
| Pending | `meal-card-pending` | `badge-pending` | `{colors.primary}` | `{colors.canvas}` |
| Eaten (conformant) | `meal-card-eaten` | `badge-eaten` | `{colors.success}` | `{colors.accent-green-soft}` |
| Eaten (non-conformant) | `meal-card-eaten` | `badge-warning` | `{colors.warning}` | `{colors.warning-soft}` |
| Skipped | `meal-card-skipped` | `badge-skipped` | `{colors.muted}` | `{colors.surface}` |
| Out of window | `meal-card-out-of-window` | `badge-warning` | `{colors.warning}` | `{colors.warning-soft}` |

### Diet Plan Status

| Status | Visual |
|---|---|
| Draft | Gray border, "Rascunho" badge in `{colors.muted}` |
| Under review | Teal border, "Em revisão" badge in `{colors.primary}` |
| Active | Green border + green-soft background, "Ativa" badge in `{colors.success}` |
| Inactive | Muted text, no border emphasis, "Inativa" badge in `{colors.muted}` |

### Calorie Progress

| State | Bar Fill | Text | Context Message |
|---|---|---|---|
| Under target | `{colors.primary}` teal | "X kcal restantes" | "Bom ritmo! Continue assim." |
| On target (±10%) | `{colors.primary}` teal | "Na meta!" | "Está no caminho certo." |
| Over target | `{colors.accent-warm}` orange | "X kcal acima" | "Hoje passou um pouco, mas olha a semana: déficit de Y kcal!" |

### Loading States

- **Skeleton screens** for meal cards, stat cards, and chat messages. Use `{colors.surface}` as the skeleton base with `{colors.surface-raised}` as the shimmer highlight.
- **Spinner** (teal, 24px) for AI response loading in chat.
- **Progress bar shimmer** for calorie bar while data loads.

### Empty States

- **No meals yet:** Illustration + "Sua dieta ainda não está ativa. Ative um plano para começar." + `{button-primary}` "Criar dieta".
- **No weight logs:** Scale illustration + "Nenhum registro de peso ainda. Registre seu primeiro peso!" + `{button-primary-soft}` "Registrar peso".
- **No chat history:** Chat illustration + "Converse com a IA sobre trocas, dúvidas e ajustes na dieta."

## Mobile Patterns

### Bottom Navigation

- Fixed to bottom, 64px height, `{colors.canvas}` background, `{shadows.sm}` top shadow.
- 5 items with icon (20px) + label (`{typography.caption}`).
- Active state: icon and label in `{colors.primary}`.
- Inactive state: icon and label in `{colors.muted}`.
- Safe area: Content scrolls behind the nav with 80px bottom padding (64px nav + 16px gap).

### Bottom Sheet

- Triggered by: tapping a meal card, swap button, weight entry, confirmation actions.
- Slides up from bottom with `{shadows.xl}` and `{rounded.xl}` top corners.
- Drag handle: 36px × 4px pill in `{colors.border-strong}`, centered, 8px from top.
- Dismiss: drag down, tap outside, or close button.
- Desktop: renders as centered modal with `{rounded.xl}` on all corners.

### Floating Action Button (FAB)

- Position: bottom-right, 16px from right edge, 16px above bottom nav.
- 56px circle, `{colors.primary}` background, `{colors.on-primary}` "+" icon (24px).
- Shadow: `{shadows.lg}`.
- On scroll down: hides with animation. On scroll up: reappears.

### Swipe Gestures

- **Swipe right on meal card:** Quick action — "Registrar" or "Pular" depending on status.
- **Swipe left on meal card:** Delete (only for meal logs, not planned meals).

### Pull to Refresh

- Standard pull-to-refresh on dashboard and meals list.
- Spinner in `{colors.primary}`.

### Onboarding Wizard

- Full-screen steps with `{onboarding-stepper}` at top.
- "Continuar" primary button fixed to bottom with 16px padding.
- "Voltar" text link above the button.
- Progress: stepper dots + percentage in `{typography.caption}`.

### Chat

- Full-screen chat with messages scrolling from bottom.
- Input fixed to bottom (above safe area on iOS).
- AI responses stream in with a typing indicator (3 bouncing dots in `{colors.primary-soft}`).
- User messages right-aligned, teal background.
- AI messages left-aligned, surface background.

## Dark Mode (Future)

Dark mode tokens are defined but **not implemented in the MVP**. They're documented here so components can be built with dark mode in mind.

| Light Token | Dark Token | Value |
|---|---|---|
| `{colors.canvas}` | `{colors.surface-dark}` | #1c1917 |
| `{colors.surface}` | `{colors.surface-dark-elevated}` | #292524 |
| `{colors.surface-raised}` | #3f3a36 | |
| `{colors.ink}` | #fafaf9 | |
| `{colors.body}` | #d6d3d1 | |
| `{colors.muted}` | #a8a29e | |
| `{colors.border}` | #44403c | |
| `{colors.border-strong}` | #57534e | |
| `{colors.primary}` | #2dd4bf | (lighter teal for dark backgrounds) |
| `{colors.primary-soft}` | #134e4a | |
| `{colors.primary-subtle}` | #0c3a36 | |

## Do's and Don'ts

### Do

- Use `{colors.primary}` (teal) for all interactive elements — buttons, links, active states, progress fills. It's the patient's "action" color.
- Use `{colors.accent-warm}` (orange) sparingly for food-related highlights and "over target" states. Its impact comes from rarity.
- Use `{typography.stat-lg}` and `{typography.stat-md}` for calorie numbers and progress percentages. These are the hero moments — make them big and bold.
- Use the 4px left border on meal cards to communicate status at a glance. A patient should see their day's status before reading any text.
- Use `{colors.accent-green-soft}` for success states and `{colors.warning-soft}` for "off track" states. Never use `{colors.danger}` for dietary feedback — only for destructive actions.
- Use bottom sheets for secondary actions (swap, weight entry, meal details). They feel native on mobile and don't lose context.
- Use `{colors.canvas}` (#fffbf7) as the page background. Pure white (#ffffff) reads as clinical and cold for a nutrition app.
- Use `{shadows.sm}` + border for cards. Shadow alone doesn't provide enough separation on warm backgrounds.
- Leave generous vertical spacing between dashboard sections (24px mobile, 32px desktop). Patients check the app quickly — clarity beats density.
- Use Plus Jakarta Sans tabular figures (`font-variant-numeric: tabular-nums`) for all numeric displays so calorie numbers don't jump around as values change.

### Don't

- Don't use `{colors.danger}` (red) for dietary feedback. Red means "you failed" — the app's philosophy is encouragement, not punishment. Use `{colors.warning-soft}` (yellow) for "off track" and `{colors.accent-warm}` (orange) for "over target."
- Don't use `{colors.accent-warm}` as a primary action color. It's an accent, not a button color. Primary buttons are always teal.
- Don't use pure white (#ffffff) as a page background. The warm white (#fffbf7) is intentional — it makes the app feel like a kitchen, not a hospital.
- Don't use weight 400 for headings or weight 600+ for body text. The hierarchy is strict: 800/700 for stats, 600 for titles/labels, 500 for important body, 400 for running text.
- Don't use `{rounded.pill}` for primary buttons. Pills are for badges and status tags only. Primary buttons use `{rounded.lg}` (16px).
- Don't put more than one `{button-primary}` per screen. Secondary actions use `{button-secondary}` or `{button-primary-soft}`.
- Don't use bottom sheets for the chat interface. Chat is a full-screen experience with its own bottom nav state.
- Don't show calorie numbers without context. Always pair a number with a comparison: "580 kcal de 600 kcal meta" not just "580 kcal".
- Don't use skeleton loading for more than 2 seconds. After 2 seconds, show a meaningful empty state or error message.
- Don't animate progress bars on initial load. Animate only on value changes (e.g., when a meal is logged and the bar updates).

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav, full-width cards, bottom sheets |
| Tablet | 640–1024px | Single column with wider cards, bottom nav persists |
| Desktop | ≥ 1024px | Sidebar nav (240px) + content area (max 480px centered), modals instead of bottom sheets |

### Mobile (< 640px)

- Bottom navigation is fixed and always visible.
- Content area has 16px horizontal padding.
- Cards are full-width.
- Chat is full-screen.
- Onboarding is full-screen with stepper.
- FAB is visible on dashboard.

### Tablet (640–1024px)

- Same as mobile but cards can be slightly wider.
- Bottom nav persists.
- Bottom sheets can be wider (max 480px centered).

### Desktop (≥ 1024px)

- Bottom nav converts to left sidebar (240px) with icon + label.
- Content area max-width 480px, centered in remaining space.
- Bottom sheets become centered modals with `{rounded.xl}` on all corners.
- FAB remains but positioned relative to content area.
- Stat cards on dashboard can form a 2×2 grid.

## Iteration Guide

1. **Start with one component at a time.** Reference its YAML key directly (`{component.meal-card}`, `{component.calorie-bar}`).
2. When adding a new component, decide which category it belongs to: **navigation**, **action** (buttons), **data display** (cards, stats), **feedback** (badges, toasts), or **input** (forms, chat).
3. Every new color must be added to the `colors:` frontmatter with a semantic name, not just a hex value. No raw hex in component code.
4. Use `{token.refs}` everywhere in documentation. Hex codes appear at most once next to the reference.
5. Test every component on a 390px-wide viewport first. If it doesn't work at 390px, it doesn't work.
6. The `{typography.stat-*}` tokens are the most important visual elements in the app. If a screen doesn't have a stat number, it probably needs one.
7. When in doubt about emphasis: bigger number before bolder text, teal before orange, encouragement before information.

## Known Gaps

- **Dark mode** tokens are defined but not implemented. Components should be built with CSS custom properties to enable future dark mode without restructuring.
- **Animation timing** is not specified. Recommended: 200ms ease-out for micro-interactions (button press, badge appear), 300ms ease-in-out for sheet/modal transitions, 500ms for progress bar fills.
- **Form validation states** beyond `text-input-focus` and `text-input-error` are not fully specified. Success state for inputs (green border) needs testing.
- **Toast/notification system** is not specified. Recommended: bottom-center toast with `{colors.primary-soft}` background for success, `{colors.warning-soft}` for warnings.
- **Accessibility audit** is pending. All color combinations should meet WCAG AA (4.5:1 for body text, 3:1 for large text). The `{colors.primary}` on `{colors.canvas}` combination needs verification.
- **Icon set** is not specified. Recommended: Lucide icons (consistent stroke width, tree-shakeable, React-friendly).
- **Illustration style** for empty states is not defined. Should be simple, warm, and encouraging — not clinical or cartoonish.