# Silvia design tokens — v0.1

**Product:** Native phone app (iOS-first). Never a website.  
**North star:** Autopilot morning film — phone in hand, one decision left.  
**Demo disposition:** grok.me page is concept only. Desktop sidebar IA and Grok chrome do not ship.

**Product job:** Continuous autonomous life management at the allowed tier — not a morning ritual. Time of day is when the household checks in; Silvia runs overnight and always. Evening conflict + wake-up was a demo beat to prove she acted while they slept.

**North star (visual):** Autopilot film phone UI — paper / forest / night. Do not lock copy or IA into “morning app.”

## Color

| Token | Value | Use |
|---|---|---|
| `paper` | `#F3F1EB` | Default screen ground |
| `paper-elevated` | `#FAF8F4` | Cards on paper |
| `forest` | `#1C5C48` | Primary actions, brand mark, positive status |
| `forest-muted` | `#D8E6E0` | Soft selected / chip fill |
| `night` | `#0B1412` | Focus surfaces (deep decisions, trades), ink |
| `ink-secondary` | 62% night | Body secondary |
| `warn` | `#C4A574` | Not eligible / caution |
| `danger` | `#8B3A3A` | True risk / break-plan only |

Paper is default. Night is for concentration — not a second product skin.

## Type

- **Display:** Instrument Serif — greetings, decisions, life numbers
- **Body:** Figtree — UI and explanations
- **Mono:** IBM Plex Mono — timestamps, rates, trade ticks

Hero greeting ≈ 34px. Tracked labels 11px / 0.08em. Short sentences. No emoji. No hype.

## App chrome

Phone only. Status bar + content + 6-tab bar. No desktop sidebar. No “Tiers / Watch film” website header. No “Created with Grok” chrome.

## App IA

| Tab | Job |
|---|---|
| **Home** | Life she already ran; what changed; what needs you |
| **Money** | Bank, cash, cards, debts, bills, instrument drill-downs |
| **Pay** | Venmo / Zelle / Cash App — send, request, history, linked handles |
| **Decide** | Open household decisions |
| **Portfolio** | Stocks, trading, investments |
| **Ask** | Silvia — OS conversation for the household’s financial life |

**Access (Misfits)** lives under Portfolio / Decide as a mode surface in v0.1; mode only — never its own tab.  
**Tiers are modes**, not destinations: Core / Managed / Misfits / Autopilot change how much she runs on the same surfaces.

## Mark

One mark: folded S (film end card). Wordmark “Silvia” in display serif. No tree mark + alternate header mark.

## Voice

Early-30s executive assistant. Warm, not bubbly. Slightly futuristic. Never robotic.  
Line: *Every financial product gives people tools to manage their money. Silvia manages the tools.*  
Demo household: Anthony. Concept, not live advice.


## Home surface rules (v0.2)

- **Empty until use.** Hero, status chips, and Needs you stay blank/neutral until the household connects and Silvia has real signal. Demo scenarios are examples only — never default copy.
- **Current Status** (not “Market Response”). Baseline when nothing material happened: on track / quiet. Elevates only when something important changed, narrates what she did, then returns to baseline.
- **Needs you.** High-contrast night card pattern. Empty until a real decision exists. One at a time.
- **Tabs:** Home · Money · Pay · Decide · Portfolio · Ask.


## Home Current Status — three states

1. **Empty** — not connected. Placeholder only.
2. **Quiet** — connected; nothing material. “On track.” Quiet days stay quiet. Needs you empty.
3. **Elevated** — material change. Narrates what Silvia did. Needs you only if a human decision exists.

## Money tab

Bank, cash, credit cards, bills. Empty until linked. Live: spendable, available today, paycheck routing, accounts, upcoming bills.


## Money depth (v0.2)

- **Debts live on Money** — credit cards, auto loans, other owed balances. Not a separate tab.
- Rows are tappable → detail screens (balance, payment/due, history or schedule, Silvia’s plan/status).
- Empty-until-connect for list and details.


## Instrument detail pattern (universal)

Any connected Money instrument — asset or liability — opens the same drill-down pattern. Not limited to cards or auto loans.

**Every detail screen**
1. Back to Money
2. Type label (Credit card / Auto loan / Mortgage / Student loan / Checking / …)
3. Name + short status line
4. Key stats (type-appropriate): balance, payment/due, rate/limit, remaining term, etc.
5. Silvia’s plan or status (what she’s doing / what’s on track)
6. History or schedule (purchases, payments, upcoming)

**Empty until linked.** Exemplars in shell: credit card, auto loan, mortgage. Same pattern applies to student loans and any future connected type — do not treat the exemplar set as a closed list.


## Pay tab


- Empty until a rail is linked.
- Live: Send / Request, choose rail + person + amount, pull from spendable when sending, recent activity + open requests.
- Drill-down follows the universal instrument pattern where it fits (linked handle, rail status, activity).
- Goal: household can do the same jobs without leaving Silvia.

## Upcoming Money types (roadmap — do not fully design this pass)

Automated life payments that belong in the same Money system later:

- Expressway / toll tags
- License plate & registration renewals
- Similar recurring civic / mobility obligations

Same empty-until-connect + instrument detail pattern. Spec later; leave IA room now so we don’t paint into a corner.


## Tab bar (v0.4 IA)

**Home · Money · Pay · Decide · Portfolio · Ask**

- **Money** — bank/cash/cards/debts/bills + instrument details. Not the home for P2P.
- **Pay** — first-class tab for Cash App, Zelle, Venmo (and similar). Send, request, history, linked handles. Empty until linked. Goal: replace those native apps for the same jobs.
- Light cross-link from Money → Pay is ok; do not duplicate Pay as a primary Money section.

## Upcoming Money types (roadmap)

Automated life payments later in the same system: expressway tolls, license plate / registration renewals, similar civic/mobility obligations. Same empty-until-connect + instrument pattern. Not designed this pass.


**Naming:** Tab and UI copy say **Pay** only. Never Peer, PeerPay, or P2P in the product UI.


## Decide tab

Decisions the household still needs to make. Same feed as Home **Needs you** — one clear decision at a time when something arises; empty when nothing needs a human.

- Empty until a real decision exists (not demo-locked).
- Live: list/stack of open decisions; tap into a decision card (context, Silvia’s recommendation, options, confirm).
- Autopilot may prepare the rails; Decide is where the human finishes.


## Portfolio tab

Investments home: stocks, trading — **not** Money debts.

- Empty until brokerage / retirement linked.
- Live: total invested, overnight moves, Investments, Trading, convictions, **Misfits access** as a mode surface (not its own tab).
- **Discover:** Browse (search + **category catalog**), Favorites, ticker detail, **Market news**. Discovery only by default; execution via Silvia + rules.


## Portfolio naming (locked)

- Long-term pot = **Investments** (never “book” / “core book”)
- Isolated trading pot = **Trading** (never “sleeve” / “trading sleeve”)
- Product split stays: Investments untouched by daily Trading; Trading has a daily risk cap.


## Ask tab

**Ask = Silvia** — the built-in personal assistant for the household’s financial life. OS conversation surface, not a bolt-on chatbot.

- First-run: who she is; prompts until accounts link.
- Live: short, warm, early-30s EA voice. No emoji. No hype. No invented returns.
- She can reference Home, Money, Pay, Decide, and Portfolio context.
- **Core chips:** “Can I afford X?” (spendable + buffer) and “Why didn’t X pay?” (autopay / held / fail). See Core v1 · Ask plan chips. Shell: `ask-core.html`.


## Portfolio discovery (shipped in shell)

- **Browse:** Search by name/ticker **and** pre-populated **Categories** (Tech giants, Dividend, Energy, Healthcare, Commercial space, ETFs, Crypto-adjacent, Most held, …). People browse shelves first; tickers are optional.
- Flow: Category → curated list → ticker → Favorite / Ask Silvia.
- **Favorites:** Watchlist; feeds convictions.
- **Market news:** Headlines under Browse / Portfolio. Where relevant, attach Silvia’s action note (what she already did) or Favorites / Decide context — not a raw firehose.
- **Default path:** Watch + Ask. Most Trading stays Silvia-executed under rules/tier — not a DIY trade ticket as primary.
- **Naming locked:** **Investments** / **Trading**. Never “book” or “sleeve” in UI.



## Pay depth (shell)

- Tab and UI copy: **Pay** only. Never Peer, PeerPay, or P2P.
- Rails: Cash App, Zelle, Venmo (and later other mobile rails). Linked handles on Pay.
- Flows: Send / Request compose → **Confirm** → **Pending** or **Failed** detail → History.
- Money moves from **spendable inside plan** — never bills or debt reserves without a Decide.
- Failed: restore spendable; offer retry on same or alternate rail.


## Core v1 lock (active)

**Core is the only v1 focus.** Household finances: bills, audit, plan build/maintain, life money ops taken care of.

**Tabs in Core product story:** Home · Money · Pay · Decide · Ask.  
(Portfolio remains in shell for next-tier review — do not deepen Trading / Misfits / investment Autopilot in Core packs.)

**Tier chip on Core screens:** label **Core** (not Autopilot).

### Bills (Money)
- Hub: Upcoming / Paid recently / Overdue. Status pills: Autopay on · Reserved · Needs you.
- From spendable inside the plan. Pay is for people; bills live under Money.
- Detail: amount, due, autopay, plan impact, what Silvia will do / did. CTA only if human needed.
- Shell: `money-bills.html`, `money-bill-detail.html`. Decide path: `decide-bill.html`.

### Audit (Money)
- Summary of covered vs gaps (subscriptions, missing autopay, duplicates, insurance). Feels like she already looked — not a spreadsheet.
- Finding detail → Approve / Not now → Decide if human required.
- Shell: `money-audit.html`, `money-audit-finding.html`. Decide path: `decide-audit.html`.

### Plan (Money / Home framing)
**Source of truth:** `CORE-PLAN.md`.

**Core job (one-liner):** Bread-and-butter auto bill pay + planning/budgeting — on track, bills on time, manage money. Foundation for wealth. **Not** investing Autopilot.

**Model:** income + expenses → plan (spendable + Core buckets Bills · Buffer · Flexible + bill autopay schedule) → she runs it; **Decide** only on guardrail breaks (priority bill miss risk, buffer below floor, pay fail, audit gap).

- Empty until income **or** expenses land — never invent numbers.
- Live overview: inputs summary (income + expenses), spendable hero, Core buckets, autopay/bill schedule, buffer-floor guardrail, quiet taken-care-of crosslink. Retirement is not a Core bucket row.
- Open defaults: buffer = 2 weeks essentials; cards autopay **minimum** (statement pay = explicit rule); pay from designated checking.
- Edit one rule (buffer floor / bill autopay / flexible allocation); show spendable + bucket impact; confirm.
- **Core household only** — not investing Autopilot rebalance.
- Shell: `plan.html`, `plan-edit.html`. Decide path: `decide-plan.html` (conflict / break-plan).

### First-run onboarding (Core)
Sequence from `CORE-PLAN.md`: connect (or manual income + bill list) → audit snapshot → propose plan (spendable + Bills/Buffer/Flexible + autopay + buffer floor) → **one** human confirm → she runs.

- Empty until income **or** expenses land — never invent numbers.
- Both paths visible on start: link accounts **or** enter manually.
- Progressive / editorial — not a 12-step wizard.
- Shells: `onboard-connect.html`, `onboard-income-expenses.html`, `onboard-audit.html`, `onboard-plan-propose.html`.
- **Plan-confirm Decide:** `decide-plan-confirm.html` — night / Needs-you. Options: Confirm plan & run · Adjust a rule · Not now. The one human gate before autopilot; not per-bill confirms. Appears as a Core exception type alongside bill / audit / plan break.

### Ask · Core plan chips
- Affordance chips grounded in the live plan (structure only — no advice theater):
  - **Can I afford X?** → answer against spendable + buffer floor; excess opens Decide rather than dipping reserves.
  - **Why didn’t X pay?** → held / fail / not-in-plan explanation tied to autopay rules.
- Feels like OS assistant for household money life. Shell: `ask-core.html` (empty + live threads). Existing `ask.html` remains general Ask chrome.

### Decide exceptions (Core)
- Primary Needs you: bill / audit / plan exceptions — not Trading.
- Types: bill failed or amount jump; audit gap; plan conflict / break-plan request.
- Night card pattern. Car replacement may remain as a Waiting household example.

### Taken care of
- Quiet proof card (bills paid, paycheck routed) — not a noisy feed. Optional on Home / Plan.

### Next tier (not v1 deepen)
- Portfolio discovery, Trading, Misfits, investment Autopilot — shipped shells stay for review but are out of Core v1 scope.
- **Future-tier look pack (not v1 product):** Managed Portfolio status + exceptions, Misfits access mode (under Portfolio/Decide — never its own tab), Investing Autopilot overnight proof, Managed Decide exception. Index section: **Next tier (not v1)**. Every screen labeled Next tier · not v1 with Managed / Misfits / Autopilot chips as fit. Core remains the only v1 focus.
- Shells: `tier-managed-portfolio.html`, `tier-misfits.html`, `tier-autopilot-investing.html`, `portfolio-managed-exception.html` (+ existing portfolio discovery).

### Pay depth
- **Approved and locked.** Do not edit pay*.html or Pay shots in Core packs.

