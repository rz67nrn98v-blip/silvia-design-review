# Silvia Core v1 — Screen map (Eng)

**Status:** Design surface sufficient for Eng. Do not invent more Core screens unless Eng/CoS asks.  
**Product rules:** [`CORE-PLAN.md`](./CORE-PLAN.md)  
**Review index:** [`index.html`](./index.html) · shells under `shell/`  
**Demo household:** Anthony · **Tier chip:** Core  
**Out of Core v1:** Portfolio / Trading / Misfits / investing Autopilot (`shell/tier-*`, `shell/portfolio-*`) — look-only, labeled not-v1.

**Job:** Get finances on track, bills on time, manage money — start of wealth. Actively managed autopay + planning/budgeting.

**Plan model (one line):** income + bills until next payday → **leftover** → optional commitments (card extra if debt; buffer if opted in) → **spendable** (headline) + autopay → Decide on exceptions. Never invent numbers.  
**Engine:** [`SILVIA-CORE-ENGINE.md`](./SILVIA-CORE-ENGINE.md) · short locks: [`CORE-PLAN.md`](./CORE-PLAN.md)  
**Adopted leftover-first:** Sep 25 2026 · revert Design tip `a6e4324`

---

## Eng build order

Build and ship in this sequence. Each row is a static Design shell Eng can open in the review site.

### 0 · First-run onboarding

| # | Shell | Eng job |
|---|---|---|
| 0.1 | [`shell/onboard-connect.html`](shell/onboard-connect.html) | Link accounts **or** enter income/expenses manually |
| 0.2 | [`shell/onboard-income-expenses.html`](shell/onboard-income-expenses.html) | Capture / review income + expenses (empty until both exist) |
| 0.3 | [`shell/onboard-audit.html`](shell/onboard-audit.html) | First-run covered vs gaps before plan propose |
| 0.4 | [`shell/onboard-plan-propose.html`](shell/onboard-plan-propose.html) | Leftover first → spendable large; **card ask only if hasDebt**; **buffer** ask; no-debt variant |
| 0.5 | [`shell/decide-plan-confirm.html`](shell/decide-plan-confirm.html) | **One human gate:** Confirm & run · Adjust a rule · Not now. Then she runs. |

### 1 · Money — bills, audit, plan

| # | Shell | Eng job |
|---|---|---|
| 1.1 | [`shell/money.html`](shell/money.html) | Money hub (spendable, accounts, debts, bills entry) — Eng owns; Design light-touch only |
| 1.2 | [`shell/money-bills.html`](shell/money-bills.html) | Bills hub: upcoming / paid / **overdue with catch-up path** (not list-only) |
| 1.3 | [`shell/money-bill-detail.html`](shell/money-bill-detail.html) | One bill: amount, due, autopay; **cards = pay-more ask** (never quiet min) |
| 1.4 | [`shell/money-audit.html`](shell/money-audit.html) | Continuous audit summary — covered vs gaps |
| 1.5 | [`shell/money-audit-finding.html`](shell/money-audit-finding.html) | One finding → proposed action; **behind → catch-up sequence** → Decide |
| 1.6 | [`shell/plan.html`](shell/plan.html) | Plan live: spendable + Bills / Buffer **goal** / Flexible / Debt extra + card pace (her amount) |
| 1.7 | [`shell/plan-edit.html`](shell/plan-edit.html) | Buffer **goal** opt-in/change/pause; Sapphire **pay-more** four options |

**Instrument drill-downs (supporting Money, not a separate product):**  
[`money-card.html`](shell/money-card.html) · [`money-loan.html`](shell/money-loan.html) · [`money-mortgage.html`](shell/money-mortgage.html)

### 2 · Pay (approved — locked)

People payments from **spendable** after bills + buffer are safe. Not a substitute for bill autopay.

| # | Shell | Eng job |
|---|---|---|
| 2.1 | [`shell/pay.html`](shell/pay.html) | Hub: send / request / history · Cash App, Zelle, Venmo |
| 2.2 | [`shell/pay-compose.html`](shell/pay-compose.html) | Compose send or request |
| 2.3 | [`shell/pay-confirm.html`](shell/pay-confirm.html) | Confirm before it goes |
| 2.4 | [`shell/pay-status.html`](shell/pay-status.html) | Pending / failed / history |

> Design: **do not reopen** Pay unless Eng/CoS asks. Legacy `peer*.html` / `money-p2p.html` are superseded — prefer `pay*`.

### 3 · Decide — Core exception types only

Same stream as Home **Needs you**. One at a time. Night card pattern.

| # | Shell | Type |
|---|---|---|
| 3.0 | [`shell/decide.html`](shell/decide.html) | Hub — lists Core exception types |
| 3.1 | [`shell/decide-plan-confirm.html`](shell/decide-plan-confirm.html) | First-run plan confirm (see 0.5) |
| 3.2 | [`shell/decide-bill.html`](shell/decide-bill.html) | Bill fail / amount jump / held autopay |
| 3.3 | [`shell/decide-audit.html`](shell/decide-audit.html) | Audit gap needs human |
| 3.4 | [`shell/decide-plan.html`](shell/decide-plan.html) | Plan conflict / break-plan |
| 3.5 | [`shell/decide-buffer.html`](shell/decide-buffer.html) | Buffer breach — **only if goal active + funded**; skip · partial · move · delay |
| 3.6 | [`shell/decide-card-paymore.html`](shell/decide-card-paymore.html) | Card pay-more each cycle — her $ · own · statement · min this cycle only |
| 3.7 | [`shell/decide-catchup.html`](shell/decide-catchup.html) | Behind — approve catch-up sequence · adjust priorities · partials |

Legacy household example (optional, not Core money-ops): [`decide-detail.html`](shell/decide-detail.html) (car).

### 4 · Home — quiet proof

| # | Shell | Eng job |
|---|---|---|
| 4.1 | [`shell/index.html`](shell/index.html) | Home states: empty / quiet Current Status / elevated + Needs you |
| 4.2 | [`shell/home-handled.html`](shell/home-handled.html) | “Taken care of” — bills paid, paycheck routed; not a noisy feed |

### 5 · Ask — OS assistant (plan-grounded)

| # | Shell | Eng job |
|---|---|---|
| 5.1 | [`shell/ask-core.html`](shell/ask-core.html) | Chips: afford / why didn’t pay / **What should I pay on the card?** / **How do we get current?** |
| 5.2 | [`shell/ask.html`](shell/ask.html) | Broader Ask empty + live (supporting) |

---

## Happy path (reference)

```
onboard-connect
  → onboard-income-expenses
  → onboard-audit
  → onboard-plan-propose   ← leftover / spendable; card if debt; buffer ask
  → decide-plan-confirm   ← one confirm
  → decide-catchup when behind; decide-card-paymore each card cycle
  → home-handled + money/plan run quietly
  → decide-* only on exceptions
  → ask-core against the live plan
```

Pay sits beside Money for people rails; it does not replace bills.

---

## Explicitly not Core v1 Eng scope

| Area | Shells (look only) |
|---|---|
| Next tier | `tier-managed-portfolio.html`, `tier-misfits.html`, `tier-autopilot-investing.html`, `portfolio-managed-exception.html` |
| Portfolio discovery | `portfolio.html`, `portfolio-browse.html`, `portfolio-category.html`, `portfolio-news.html`, `portfolio-favorites.html`, `portfolio-ticker.html`, `portfolio-trades.html` |

---

## Design / Eng contract

- **Source of plan truth:** `CORE-PLAN.md`  
- **Visual system:** `tokens/TOKENS.md` + `tokens/tokens.css` + `shell/shell.css`  
- **Shots:** `shots/core-*.png` for latest Core packs  
- Design stands by after this map. More Core screens only if Eng or CoS requests.
