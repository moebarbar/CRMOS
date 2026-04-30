# CRMOS — Brand & UI Guide

> **CRMOS is the operating system for service businesses.** Sales, delivery, billing, and an AI operator named **Moe** in one workspace. Built for studios, agencies, freelancers, and consultants who run their whole business on it — not just their sales pipeline.

---

## 1. Brand Foundation

### 1.1 What we are
CRMOS replaces the duct-taped stack of CRM + proposal tool + contract tool + invoicing + project management + scheduling that every studio cobbles together. **One workspace, one bill, one source of truth — and an AI that actually does the work, not just summarizes it.**

### 1.2 What makes us different
Every other CRM is built around the *deal*. CRMOS is built around the *engagement* — the full arc from lead → proposal → signed contract → delivered project → paid invoice → renewal. Moe sits across the whole thing: he doesn't just write follow-ups, he chases AR, drafts SOWs in your tone, books client calls, and tells you what's actually on fire today.

### 1.3 Who it's for
- **Independent studios** (3–30 people) running design, dev, marketing, video, architecture, consulting
- **Boutique agencies** that bill by project or retainer
- **Solo operators** who want to look like a 10-person firm
- **Operations leads** at services companies tired of stitching Pipedrive + DocuSign + QuickBooks + Asana together

### 1.4 Who it's *not* for
- Pure SaaS sales teams (use a sales-led CRM)
- Enterprise procurement (use Salesforce)
- E-commerce / B2C transactions

### 1.5 Brand voice
**Direct. Wry. Operator's voice.** We talk like the smartest person in a 4-person studio who's seen every tool fail and finally built the right one.

| Do | Don't |
|---|---|
| "Moe drafted 3 chases. Review before they go." | "Empower your business with AI-driven insights." |
| "11 days overdue. Send the chase." | "Optimize your accounts receivable workflow." |
| "One bill. One workspace. One source of truth." | "Unified, end-to-end, holistic platform." |
| Use specific numbers ($12.8k, 11 days, 3 chases) | Use vague claims ("more efficient", "faster") |
| Show the work ("drafted in your tone") | Hide behind "AI-powered" |

**No emoji** in product copy. No exclamation marks except in error states. No corporate adjectives ("seamless", "robust", "powerful"). If it sounds like a SaaS landing page from 2019, rewrite it.

### 1.6 Naming & terminology
- The product: **CRMOS** (one word, all caps in logo, "CRMOS" in body)
- The AI: **Moe** (short for "the operator", proper noun, always capitalized)
- The unit of work: **engagement** (not "deal", not "opportunity")
- Money owed to you: **AR** or "overdue" (not "outstanding receivables")
- Pipeline stages: **Lead → Qualified → Proposal → Won → Active → Wrapped**

---

## 2. Logo & Mark

### 2.1 Wordmark
`CRMOS` set in **Inter ExtraBold (800)**, letter-spacing `-0.02em`. The "OS" should never be visually separated from "CRM" — it's one word, one ligature in spirit.

### 2.2 Moe — the icon
Moe is a friendly two-eyed operator: a squircle head, white eyes with dark pupils that drift continuously ("looking around"), an antenna with a pulsing accent dot, and an animated halo ring that always rotates. He has four states:

| State | Use |
|---|---|
| `idle` | Default — soft smile, slow halo, gentle pupil drift |
| `listening` | User is typing/talking to Moe — brighter halo, faster rotation |
| `thinking` | Moe is working on something — animated dots mouth, raised brows, wider pupil glances |
| `speaking` | Moe is responding — voice waveform mouth |

**Moe is always animated.** Pupils always drift. Halo always rotates. Static Moes look dead. The animation differences between states should be subtle but recognizable — never jarring.

**Color rules:** Moe's body color is the user's brand accent (default indigo `#4f46e4`). Eyes are always pure white with a tinted-dark pupil. Never recolor the eyes; they're how Moe reads as alive.

**Sizes:** 16, 20, 26, 32, 48, 80, 120 px. Never below 16 (eyes lose detail). Above 120, switch to a hero illustration.

---

## 3. Color System

CRMOS is **theme-aware** with a **user-customizable accent**. Two themes (dark + light), one accent that flows through.

### 3.1 Brand accent (default)
- **Indigo** `#4f46e4` — primary brand accent. Confident, technical, distinct from every other CRM (no Salesforce blue, no HubSpot orange, no Pipedrive green).
- Bright variant `#7d75ee`, dim `#3730a3`, glow `rgba(79,70,228,0.22)`

The accent is exposed as a tweak. Users can pick: indigo (default), magenta `#e538df`, lime `#c4f048`, coral `#fb7185`, sky `#60a5fa`, violet `#a78bfa`, amber `#fbbf24`. The whole UI re-themes via the `--lime` CSS variable (legacy name from when lime was the default — now it's the user's accent).

### 3.2 Dark surfaces — the default
Near-black with a slight green undertone. Not pure black; pure black feels dead.

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#07090a` | App background |
| `--bg-1` | `#0c0f10` | Cards, sidebar |
| `--bg-2` | `#11171a` | Elevated surfaces, hover |
| `--bg-3` | `#161e22` | Inputs, kbd shortcuts |
| `--bg-4` | `#1d272c` | Active rows, deepest elevation |
| `--line` | `#1f2a30` | Hairline dividers |
| `--line-2` | `#2a3942` | Borders |
| `--line-bright` | `#3a4d57` | Hover borders |

### 3.3 Light surfaces — warm paper
Light mode is **warm cream paper, not white**. White is harsh; cream feels like a designer's notebook.

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#f5f3eb` | App background |
| `--bg-1` | `#ffffff` | Cards |
| `--bg-2` | `#f0ede2` | Elevated, hover |
| `--bg-3` | `#e6e3d6` | Inputs |
| `--bg-4` | `#d8d4c4` | Deep |
| `--line` | `#d8d4c4` | Hairlines |
| `--line-2` | `#b8b3a0` | Borders |

### 3.4 Text
Dark mode text has a slight green tint (`#e8f0e8`) to harmonize with the accent. Light mode is deep ink (`#0a1108`).

| Token | Dark | Light | Use |
|---|---|---|---|
| `--text-0` | `#e8f0e8` | `#0a1108` | Primary |
| `--text-1` | `#b8c5bc` | `#2a3326` | Secondary, body |
| `--text-2` | `#7d8c84` | `#5b6356` | Captions, meta |
| `--text-3` | `#4f5d56` | `#8a907f` | Disabled, placeholder |

### 3.5 Semantic
| Token | Hex | Use |
|---|---|---|
| `--warn` | `#f59e0b` | Warnings, due-soon |
| `--danger` | `#ef4444` | Overdue, errors, destructive |
| `--info` | `#60a5fa` | Info, secondary status |
| `--ok` | accent | Success, positive trends |

### 3.6 Background texture
**Every background has a subtle grid.** 32px square grid at ~2.5% opacity in dark mode, ~5% in light. Plus a soft accent radial in hero areas. Flat backgrounds look cheap; the grid signals "this is an operator's workspace."

---

## 4. Typography

### 4.1 Type stack
- **Sans (UI + body):** Inter — weights 400, 500, 600, 700, 800
- **Mono (data + code):** JetBrains Mono — weights 400, 500, 600
- **Display:** Inter ExtraBold (800), tightly tracked

OpenType features on by default: `cv11`, `ss01`, `ss03` (cleaner Inter alternates). Mono uses `zero` and `ss02` (slashed zero, alternate I/l).

Letter-spacing: `-0.01em` baseline on body, `-0.02em` on display headings.

### 4.2 Scale (1920px reference)

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display XL (hero) | 84–96px | 800 | -0.04em |
| Display L (page H1) | 56–64px | 700 | -0.03em |
| Heading 1 | 36–40px | 700 | -0.02em |
| Heading 2 | 26–28px | 600 | -0.02em |
| Heading 3 | 18–20px | 600 | -0.01em |
| Body | 14–15px | 400 | -0.01em |
| Caption | 12–13px | 500 | 0 |
| Label | 11px | 500 | 0.05em uppercase |
| Mono data | 12–14px | 500 | 0 |
| Kbd | 11px | 500 mono | 0 |

### 4.3 Mono usage
Mono is reserved for **data the user reads as facts**: prices, dates, IDs, kbd shortcuts, terminal output, code, file paths, system messages from Moe. Never use mono for marketing prose.

### 4.4 Numbers
Always **mono for tabular numbers** (invoices, AR, line items). Use `font-feature-settings: 'tnum'` on tables. Currency uses no spacing between symbol and number: `$12.8k` not `$ 12.8k`. Abbreviate consistently: `1.2k`, `12.8k`, `1.2M`.

---

## 5. Spacing, Radius, Shadow

### 5.1 Spacing
4px base unit. Allowed values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.

### 5.2 Radius
| Token | Px | Use |
|---|---|---|
| `--r-sm` | 6 | Pills, kbd, small chips |
| `--r` | 10 | Buttons, inputs |
| `--r-lg` | 14 | Cards, modals |
| `--r-xl` | 20 | Hero cards, CTA blocks |

Never use larger than 20px except on full circles. No 4px radius — feels too tight at our type sizes.

### 5.3 Shadow
Two shadows only:
- `--shadow-1` — UI elevation (subtle inset highlight + 2px drop)
- `--shadow-glow` — accent-colored glow for primary CTAs and featured tiers

Avoid stacking shadows. Avoid blur > 32px. CRMOS uses **borders + grid** for elevation more than shadows.

---

## 6. Components

### 6.1 Button
- `.btn` — default, neutral background, subtle border
- `.btn.primary` — accent fill, white text, weight 600
- `.btn.ghost` — transparent, no border, hover-only background
- Modifiers: `.sm` (compact), `.lg` (hero CTA)

Padding scales with size: `10px 16px` default, `6px 10px` small, `14px 22px` large. Always include a leading icon slot for buttons that trigger Moe actions.

### 6.2 Card
`background: var(--bg-1)`, `border: 1px solid var(--line)`, `border-radius: 14px`. **No shadow by default.** Cards are defined by their border and grid context, not by floating.

### 6.3 Tag / Pill
`.tag` — mono 11px in a rounded pill. `.tag.lime` adds an accent tint. Use for status (Active, Won, Overdue), small metadata, kbd shortcuts.

### 6.4 Kbd shortcut
Inline mono 11px in a `.kbd` chip with a 1px shadow underneath. Always shown in command palette, button hints, sidebar search. Format: `⌘K`, `⌘/`, `esc` — symbols not words.

### 6.5 Avatar
Circle, 26–48px depending on context. Initials on a tinted background. Color is deterministic from the name hash. No photo placeholders — initials only until a real avatar is uploaded.

### 6.6 Input
`background: var(--bg-2)`, `border: 1px solid var(--line-2)`, focus border `var(--lime)`. 12px vertical padding, 16px horizontal. Mono font for fields that take IDs, codes, or amounts.

### 6.7 Moe chat bubbles
- User bubble: right-aligned, `var(--bg-3)` background, no border
- Moe bubble: left-aligned, accent-tinted `color-mix(in oklab, var(--lime) 10%, transparent)` with a thin accent border
- Always show MoeIcon next to Moe bubbles, never next to user bubbles

### 6.8 Command palette (`⌘K`)
Full-screen overlay, centered modal, mono input. Sections: **Ask Moe**, **Jump to**, **Recent**, **Actions**. Always opens with Moe ready to chat — palette is not just navigation, it's the agent's primary surface.

---

## 7. Layout

### 7.1 Marketing site
- Max content width: **1280px**, gutters 32px
- Section vertical rhythm: 96px between major sections, 64px between subsections
- Grids: 12-column with 24px gutters
- Announcement bar: full-bleed, accent gradient, animated shine

### 7.2 Dashboard
- Three-column grid: **240px sidebar** + **1fr main** + **380px Moe panel**
- Moe panel collapses to 0 when toggled off (smooth transform)
- Sidebar nav uses 4 sections: Workspace, Sales, Delivery, Connect
- Top bar: 56px tall, holds workspace switcher (left), Ask Moe button + search (right)

### 7.3 Density modes
Two densities exposed as a tweak:
- **Comfortable** (default) — generous padding, 14px body, 12px row gap
- **Compact** — 12px body, 8px row gap, tighter card padding

---

## 8. Motion

### 8.1 Principles
- **Fast and confident.** 120–240ms for UI transitions. Never longer than 400ms.
- **Easing:** `ease` for most things, `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrances.
- **Moe is alive.** Pupils always drift, halo always rotates, antenna always pulses. Moe should never look static.
- **Respect reduced motion.** All decorative animations check `prefers-reduced-motion` and stop. Functional motion (state changes, focus rings) stays.

### 8.2 Specific motion
| Element | Duration | Easing |
|---|---|---|
| Button hover | 120ms | ease |
| Card hover | 200ms | ease |
| Modal open | 200ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Moe panel toggle | 240ms | ease |
| Tab switch | 180ms | ease |
| Marquee scroll | 30s linear, infinite | — |
| Moe halo | 6–10s linear, infinite | — |
| Moe pupil drift | 1.8s interval | — |
| Antenna pulse | 2s ease-in-out, infinite | — |

---

## 9. Iconography

Use **Lucide-style stroke icons** at 1.5–2px stroke weight. 14, 16, 20, 24, 32 sizes only. `currentColor` by default; pass `var(--lime)` to highlight Moe-specific actions.

**Never use emoji in the product UI.** Marketing can use them sparingly in personal-tone contexts (testimonials, footer fun).

---

## 10. Imagery & Illustration

CRMOS uses **almost no photography**. The visual language is:
- **Real product UI** — every marketing screenshot is the actual app
- **Animated SVG** — Moe, flow diagrams, animated charts
- **Subtle grid backgrounds** — instead of stock photos
- **Abstract accent gradients** — for hero radial glows only

If you need a person, use **deterministic initials avatars**. Stock photos are forbidden. Generic 3D rendered shapes are forbidden. AI-generated illustrations are forbidden.

---

## 11. Writing Patterns

### 11.1 Numbers in copy
Lead with the number. "11 days overdue" not "overdue by 11 days". "$12.8k in AR" not "an outstanding receivables balance of $12,800".

### 11.2 Moe's voice
Moe is **terse, helpful, never apologetic**. He reports what he did and what's next.

> "Pulled 3 invoices, drafted in your tone. Review before sending?"
> "On it — chasing Northwind."
> "11d overdue. Stella ignored your last 2. Send a firmer one?"

Not:
> "I have prepared 3 invoice reminders for your review at your convenience."
> "I'll be happy to help chase Northwind for you."

### 11.3 Empty states
Always action-oriented. Never "No data yet."
- "No proposals yet. Draft one with Moe →"
- "Inbox is clear. Moe handled 14 messages overnight."

### 11.4 Errors
Specific cause, specific fix. Never just "Something went wrong."
- "Stripe rejected the card. Try another or contact the client."
- "Moe couldn't find the agenda doc — check Drive permissions?"

---

## 12. Tweaks (in-app theming)

The product ships with a Tweaks panel exposing:
- **Theme** — dark / light
- **Accent** — 7 brand-safe colors
- **Font pairing** — Inter + JB Mono / Inter only
- **Density** — comfortable / compact
- **Show Moe panel** — on / off
- **Hero variant** (marketing only) — split / terminal / editorial

All tweaks persist via `__edit_mode_set_keys` and survive reload. The Tweaks panel itself is dismissible and starts hidden — toggle from the toolbar.

---

## 13. Don'ts

- **No gradient backgrounds** on full sections (subtle radial accents only)
- **No drop shadows** for elevation — use borders + the grid
- **No emoji** in product UI
- **No stock photography** anywhere
- **No 3D blob illustrations** or abstract rendered shapes
- **No Inter Tight, no Geist, no Satoshi** — Inter classic only
- **No purple-pink SaaS gradients** — we have one accent at a time
- **No "AI sparkles"** as the primary Moe affordance — Moe is a character, not a sparkle icon
- **No dense data without mono** — numbers are mono, always
- **No hover-only critical actions** — must work on touch

---

## 14. Asset Index

| Path | What |
|---|---|
| `shared/tokens.css` | All design tokens, theme switches |
| `shared/MoeIcon.jsx` | The Moe character — 4 states |
| `shared/ui.jsx` | Avatar, Icon, common UI primitives |
| `marketing/marketing.css` | Marketing site styles |
| `dashboard/dashboard.css` | Dashboard styles |
| `tweaks-panel.jsx` | In-app tweak UI |
| `CRMOS Marketing Site.html` | Landing + sub-pages, 3 hero variants |
| `dashboard.html` | Full app dashboard with Moe panel |

---

*Last updated: April 2026. CRMOS is a fictional brand built for this exploration.*
