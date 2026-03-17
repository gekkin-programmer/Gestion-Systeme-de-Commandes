# Design System — Gestion Commandes Restaurant

## Color Palette

| Variable      | Value                  | Usage                        |
|---------------|------------------------|------------------------------|
| `--bg`        | `#100C07`              | Page background              |
| `--surface`   | `#1C1510`              | Cards, modals                |
| `--cream`     | `#F0E6D3`              | Primary text                 |
| `--cream-dim` | `#A89880`              | Secondary text, labels       |
| `--line`      | `rgba(240,230,211,0.1)`| Borders, dividers            |
| `--gold`      | `#C8A96E`              | Primary accent, CTAs, prices |
| —             | `#f87171`              | Errors, danger, cancelled    |

> Green (`#6fcf6f`) was removed — "available" status now uses gold.

## Typography

| Role            | Font                  | Size  | Notes                        |
|-----------------|-----------------------|-------|------------------------------|
| Display / Title | Playfair Display      | 16–36 | `font-weight: 400` (no bold) |
| Body / UI       | Jost                  | 9–14  | Used for all labels/buttons  |
| Section labels  | Jost                  | 9px   | `letter-spacing: 0.2em`, ALL CAPS |

## Spacing & Shape

- **Border radius**: `0` everywhere (sharp corners, no rounded)
- **Card padding**: `20px` default, `28–40px` for modals
- **Gap**: `8–12px` for grids, `4–6px` for input groups

## Buttons

| Class        | Usage                        |
|--------------|------------------------------|
| `.btn`       | Primary (gold bg, dark text) |
| `.btnOutline`| Secondary (gold border)      |
| `.btnDanger` | Destructive (red tint)       |
| `.backBtn`   | Header back/logout           |

## Key Rules

- All small badges and action chips use `#C8A96E` (gold) as primary color
- Inputs: dark bg (`--bg`), gold border on focus
- Modals: slide-up animation, gold 2px top accent bar, centered
- Hover effects: `border-color → var(--gold)` on cards/buttons
