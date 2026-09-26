# Silvia Core — Plan model (v1)

**Not financial advice.** Product rules for how Core builds and runs a household money plan.  
**Job:** Get people on track, pay bills on time, manage money. Foundation for wealth creation. Later tiers add investing / access / full Autopilot.

**Eng build truth (leftover-first):** [`SILVIA-CORE-ENGINE.md`](./SILVIA-CORE-ENGINE.md) — domain models, compiler, living plan, fixtures A–I, acceptance. If this short file and the engine conflict on math or change rules, **the engine wins**. Product locks below still win on cards / buffer / catch-up / no jargon / no invent cash.

**Adopted:** Sep 25 2026 (leftover-first).  
**Copy locks (Sep 25 2026):** Never say **floor** in user-facing Core copy. Never say Core **ran overnight** / while you slept — overnight framing is top-tier Autopilot only; Core is continuous ops when they check in. Never name a demo person (“Anthony”) in UI — generic you / your plan / Good morning; personalize later per household.

**Revert tip:** Design git `a6e4324` + `/workspace/silvia-core-revert-2026-09-25/` (CoS box).

---

## One sentence

Income + bills due until next payday → **leftover** → optional commitments (card extra only if they have debt; buffer only if they opt in) → **spendable** is the headline → she auto-pays essentials → the plan recompiles when life changes.

---

## Leftover-first (adopted)

1. Cover essentials this cycle (ranks 1–7, including card/loan **minimums** — not debt extra).  
2. Show **leftover** honestly: income this cycle − essentials. Do not hide a skim or silent survival bucket. Cash-on-hand is timing, not extra income into leftover.  
3. Commitments they accept (not auto-applied):
   - **Card extra** — only if `hasDebt`; four options; her recommend from leftover (~25% starting propose in the engine).  
   - **Buffer per payday** — only if they opt in.  
4. **Spendable** = leftover − accepted debt extra − accepted buffer contribution. Lead Home, Plan, Pay, Ask with this number.  
5. **No debt is Core-complete.** Skip card ask, hide Debt extra, hide card Ask chip.

Confirm is not a freeze. First-run confirm means **start running**. Quiet / Ask / Hard stop when facts change — see engine §7A.

---

## Inputs (required)

| Input | How it arrives | Notes |
|---|---|---|
| **Income** | Linked payroll / deposits, or user-stated net pay + cadence | Net after tax preferred; if gross, label it |
| **Recurring expenses** | Linked bills + subscriptions + detected debits | Amount, due window, priority rank |
| **Accounts** | Checking / savings / cards | Designated checking for autopay; spendable is a plan number |
| **Debts** | Cards, loans — balance, minimum, due, APR if known | Optional. No card/loan = no card path |
| **Goals (asked, not assumed)** | Buffer endeavor, debt payoff pace | Empty goals OK — she asks; she does not invent buffer cash |

Without income **or** expenses, plan stays **empty / Waiting on you** — never invent numbers.

---

## What the plan is

A living set of rules, not a spreadsheet screenshot:

1. **Spendable** — headline: money that can leave without breaking the plan until next payday  
2. **Bill schedule** — what gets paid, from where, by when (autopay on/off/held per bill)  
3. **Buckets (explain spendable; do not bury it)** — Bills · Buffer goal *(if opted in)* · Flexible *(same dollars as spendable)* · Debt extra *(only if hasDebt)*  
4. **Guardrails** — never miss a priority bill; never silently overdraft; never leave a card on minimum-only without asking

---

## Build sequence (first-run)

1. Connect accounts (or manual income + bill list)  
2. **Audit** — covered / missing / late  
3. Propose: leftover → spendable path + autopay set  
4. **Asks:**  
   - **Cards (only if hasDebt):** Pay more than minimum? Her amount · own · statement · minimum this cycle only (explicit, discouraged)  
   - **Buffer (always):** Endeavor on ~2 weeks essentials? Full · starter · not now  
5. Human confirms once → she runs  
6. If behind: catch-up Decide before or with confirm  
7. Home quiet “taken care of”; Decide only on exceptions

---

## Locked rules (do not break)

1. **Credit cards — never quiet minimum-only.** Every cycle she asks to pay more and recommends an affordable amount over minimum from leftover. Options: her amount · own amount · statement · **minimum this cycle only** (expires; she asks again).  
2. **Buffer — not assumed.** ~2 weeks of essential bills is a goal. Decline = $0 goal — no buffer reserved. Stored per-payday commitment only if they accept.  
3. **Behind — catch-up path.** Propose how to get current from real money. If income cannot cover essentials after cuts, say so.  
4. **Autopay** for fixed essentials inside the plan. She does not silently overdraft.  
5. **UI copy:** plain language only. Never “Core exception types” in the product.  
6. **Never invent numbers or cash.**  
7. **Pay tab** is people rails (Cash App / Zelle / Venmo) from spendable — not bill pay.  
8. **The plan can change.** Live is not locked. Recompile when facts change. Quiet vs Ask vs Hard stop — engine §7A.  
9. **Core is the base of the app.** New features stack on Core. Do not center v1 on Portfolio, Trading, Misfits, or Autopilot investing.  
10. **Spendable stays on screen.** Home, Plan, Pay, Ask.  
11. **Debt is optional.** No card and no loan = no card ask, no Debt extra, no payoff copy. Still Core-complete.

---

## Credit cards (locked)

- Skip the entire path when the household has no debt that takes extra.  
- Every statement cycle (and first propose): four options; her amount is a propose from leftover, not auto-applied until they choose a Pace.  
- `unset` is the default for a new card — **not** minimum.  
- No payoff-date or interest-saved claim without a real APR and estimate language.

---

## Buffer (locked)

- Ask: full ~2 weeks · starter ~1 week · not now.  
- Accept → target + `bufferPerPayday` commitment (editable in Plan).  
- Decline → $0, no buffer guardrail.  
- Guardrail “don’t break buffer without Decide” only when goal **active and funded > 0**.

---

## Behind on bills / catch-up (locked)

1. Audit arrears (real numbers only).  
2. Propose a **sequence** across this payday and the next; pause debt extra while essentials are behind; cut flexible / pause rank 8–9.  
3. One Decide on tradeoffs.  
4. If income cannot cover rank 1–5 essentials even after cuts: say so plainly (`blocked` / honest shortfall) — still a plan.

---

## Autopay policy (Core)

- **On** for fixed-amount essentials (rank ≤ 7) when checking exists and cash path is safe.  
- **Cards:** amount = chosen Pace — never silent minimum.  
- **Confirm / off** for variable or rank ≥ 8.  
- Cash short → **held** + Decide. Failed rail → Decide + retry.  
- Manual / no checking: plan may propose; autopay stays off until designated checking exists.

---

## Audit (continuous)

Daily quiet + payday + bill-due window: upcoming / paid / overdue, income landed, spendable drift, new debits, card pace expiry, buffer progress if opted in. One finding → one action → Decide if human needed.

---

## Decide (Core catalog — internal names only)

Plan confirm · Card pay-more · Catch-up · Bill fail/jump/held · Audit gap · Plan break · Buffer (only if goal active + funded).  
No Trading / Misfits / rebalance in Core. Never show taxonomy jargon in UI.

---

## Pay tab (in Core)

Send / request people from **spendable**, after essentials (and active buffer rules) are safe. Not a substitute for bill autopay.

---

## Out of Core v1

Portfolio browse / Trading / overnight invest Autopilot · Misfits · tax optimization · invented returns · complex multi-account treasury.

---

## Design / Eng map

| Surface | Job |
|---|---|
| Onboard propose | Leftover first; spendable large; card ask **only if debt**; buffer ask; no-debt variant |
| Home / Plan / Pay | Spendable headline |
| Money · Bills / card detail | Schedule + autopay + pay-more (if debt) |
| Plan edit | Buffer per payday + card four options (if debt); recompile, no second onboard |
| Decide | Card / catch-up / bill held / plan break / buffer |
| Ask | Afford · why didn’t pay · card *(hide if no debt)* · get current · what can I spend until next payday |
| Eng | Models + compiler + Fixtures A–I before more surface invention — see engine |

---

## Locked product choices

1. Buffer = opt-in goal (+ per-payday commitment when accepted).  
2. Cards never quiet minimum-only; recommend from leftover.  
3. Behind → catch-up sequence; never invent cash.  
4. One Plan confirm, then autopilot; confirm ≠ freeze.  
5. Manual households allowed.  
6. Leftover-first; spendable is the headline; no debt is Core-complete.
