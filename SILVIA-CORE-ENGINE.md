# GIVE THIS FILE TO THE GROK BUILD BOT

**File:** `SILVIA-CORE-GROK-BOT.md`  
**Owner:** Sean  
**Date:** September 24, 2026  
**Self-contained.** You do not need other docs to start. If another file conflicts with the locked rules in this document, these locks win.

---

## Bot instructions (read first, then build)

You are building **Silvia Core** for a native iPhone app (SwiftUI). This file is the spec.

Do this, in order:

1. Implement domain models and the leftover-first plan compiler.  
2. Write tests for Fixtures A–I in this file. Do not preload fixture numbers as app defaults.  
3. Wire first-run: connect or manual → income & bills → audit → plan propose → one confirm.  
4. Show **spendable** as the headline (Home, Plan, Pay).  
5. If the household has a card: card pay-more Decide every cycle. If they have no debt: skip that entire path.  
6. Live plan can change (quiet / ask / hold). Confirm is not a freeze.

Do not build Portfolio, Trading, Misfits, or Autopilot investing.  
Do not invent cash, income, APR, payoff dates, or returns.  
Do not ship Anthony demo numbers as empty states.  
Do not use internal jargon in UI (“exception types”).  
Voice: early-30s EA, short sentences, no emoji, no hype.

When you are ready, start with models + Fixture A and Fixture I.

---

# Silvia Core — Planning & Onboarding Engine

**Date:** September 24, 2026  
**Owner:** Sean  
**Status:** Build spec for Core v1. This file is what you feed the Grok / Eng bot.  
**Not financial advice.** No invented returns. No invented cash.

If this file conflicts with the locked Core rules (cards, buffer, catch-up, no jargon in UI), **the locks win**.

**Revision (Sep 24, 2026 — leftover-first):** Sean allowed a better path. v1 no longer auto-skims leftover with hidden 70/30/20 ratios or a silent “survival floor” bucket. After essentials she shows **leftover**. Debt extra and buffer are **commitments they accept**. Locks unchanged. Old split math is retired.

---

## 0. How to use this file (Grok build bot)

You are building **Silvia Core** on iOS (SwiftUI). Design shells already exist. Do not invent new Core screens unless a rule below cannot be shown on an existing shell.

**Job of this spec:** how she **onboards**, how she **builds a plan from income + bills + debt**, how that **plan changes when life does**, how she **pays bills on time**, how she **works people out of debt without lying**, and how she stays honest when the household is paycheck-to-paycheck.

**Product form:** native iPhone app. One app. Tiers are modes, not separate products.  
Tabs locked: Home · Money · Pay · Decide · Portfolio · Ask.  
**v1 is Core.** That is the base of the app — onboard, plan, bills, autopay, debt extra, catch-up, Ask.  
Later features (Managed book, Misfits access, Trading, Autopilot investing) **add onto this same household and this same plan**. They do not replace Core, do not get their own app, and do not enter the v1 build queue. Portfolio tab may exist as a labeled shell.

**Voice:** early-30s EA. Warm, not bubbly. Short sentences. No emoji. No hype. Plain language. Never “Core exception types” in UI.

**Empty until use.** Demo household (Anthony) is concept only. Never ship those numbers as runtime defaults.

After reading this file, implement:

1. Domain models in §4  
2. Plan compiler in §6–§10  
3. Living plan / change model in §7A  
4. Onboarding state machine in §11  
5. Continuous run loop in §12  
6. Decide surfaces in §13  
7. Fixtures in §16 (tests, not empty states)

Do not add investing, projected portfolio growth, or “you’ll be debt-free in 14 months” unless APR is known **and** the copy states it is an estimate from the stated APR and the chosen extra — never a promise.

---

## 1. What Core is

Silvia is a financial operating system. Core is the base business:

> Income + bills due until next payday → leftover → optional commitments (card extra only if they have debt; buffer only if they opt in) → **spendable** is what they can spend → she auto-pays essentials → the plan changes when life does.

**Spendable is the headline.** Home, Plan, Pay, and Ask lead with how much they have left to spend until next payday. Buckets explain the number. They do not bury it.

**No debt is a complete Core plan.** Many households have income and bills and no cards or loans. Skip the card ask. Hide Debt extra. Autopay + spendable (+ optional buffer) is the product. Do not invent a card to demo the feature.

Confirm is not a freeze. First-run confirm means **start running**. Every later paycheck, missed bill, new debit, raise, layoff, or “I need that money this week” can recompile the plan. Some changes she makes quietly. Some she brings as Decide. She never pretends last week’s plan is still true.

She is not a dashboard. She is not a morning ritual. She is not a chatbot bolted on. Ask is the OS assistant **against the live plan**.

**Line:** Every financial product gives people tools to manage their money. Silvia manages the tools.

**Realistic wealth in Core** (say this internally and, when asked, in Ask):

Most people who need this product live paycheck to paycheck. Core does not pretend they have a 6-month emergency fund. Wealth here has a sequence. She does not skip steps or invent a later step as if it already happened.

| Phase | Name | What “ahead” means | v1 |
|---|---|---|---|
| 0 | Survive | This cycle’s essentials can be paid from real income + cash on hand | Yes |
| 1 | Current | No overdue essentials. Autopay running. | Yes |
| 2 | Debt extra | Cards/loans get more than minimum when leftover exists | Yes — **only if they have debt** |
| 3 | Buffer endeavor | Opt-in goal toward ~2 weeks of essential bills | Yes (opt-in) |
| 4 | Invest / Managed | Long-term book | **Not v1** |

If they are in Phase 0 or 1, she does not lecture them about index funds. She gets bills paid and the plan honest.

**Core stays the base when features arrive.** Managed / Misfits / Autopilot read the same income, bills, spendable, and debts. They do not invent a second budget. A household can run Core forever. Graduation is optional and later — ideas only until Sean opens that work.

---

## 2. Locked rules (do not break)

1. **Credit cards — never quiet minimum-only.** Every cycle she asks to pay more than the minimum and recommends an affordable amount over minimum. Options: her amount · own amount · statement balance · **minimum this cycle only** (explicit, discouraged).  
2. **Buffer — not assumed.** ~2 weeks of essential bills is a goal to endeavor on. Decline = $0 floor. She never pretends the cash exists.  
3. **Behind — catch-up path.** Propose how to get current from real money. If income cannot cover essentials after cuts, say so.  
4. **Autopay** for fixed essentials inside the plan. She does not silently overdraft.  
5. **UI copy:** plain language only.  
6. **Never invent numbers or cash.** No income + no expenses = plan empty / Waiting on you.  
7. **Pay tab** is people rails (Cash App / Zelle / Venmo) from spendable. It is not bill pay.  
8. **The plan can change.** Live is not locked. Recompile when facts change. Do not keep executing a stale split, card pace, or autopay set after the inputs that produced them are gone. Quiet updates vs Decide is §7A.  
9. **Core is the base of the app.** New features stack on Core. Do not center v1 on Portfolio, Trading, Misfits, or Autopilot investing. Do not split Core into a separate app.  
10. **Spendable stays on screen.** The number they have left to spend is first-class — Home, Plan, Pay, Ask. Never hide it behind buckets or a card lecture.  
11. **Debt is optional.** No card and no loan = no card ask, no Debt extra bucket, no payoff copy. That household is Core-complete.

---

## 3. Mental model — not an ML model

She does **not** need a machine-learning algorithm to “figure people out.”

Core is a **deterministic rules engine** plus a few formulas:

```
inputs (income, bills, debts, cash, choices)
        ↓
normalize to a cycle
        ↓
rank bills by consequence
        ↓
compile plan (buckets + autopay + card pace + buffer goal)
        ↓
if shortfall → catch-up compiler
        ↓
one human confirm (first run) or Decide (exceptions)
        ↓
execute autopay inside rules
        ↓
audit on cadence → findings → Decide or quiet Home
```

Recalculate whenever any input changes: linked transaction, payday lands, bill amount jumps, user edits a rule, daily quiet audit.

No black box. Every recommended dollar must be explainable in one short sentence from the inputs.

---

## 4. Domain model

Use these names in code. Do not surface internal names in UI.

### 4.1 IncomeStream

```
id
source: linkedPayroll | linkedDeposit | manual
label                  // "Paycheck · ACME" or "Tips"
amount                 // Decimal, net preferred
isNet: Bool
cadence: weekly | biweekly | semimonthly | monthly | irregular
nextDate
weekday?               // for weekly/biweekly
```

Irregular income: do not annualize. Only count amounts that have already landed or that the human typed as expected for **this cycle**. Never forecast gig income she has not seen.

### 4.2 Bill

```
id
payee
amount                 // typical / last / stated
isVariable: Bool
dueDate                // or dueDayOfMonth + window
windowDays             // e.g. due ± 3
priority: Priority     // see §5
category: housing | utility | transport | insurance |
          telecom | childcare | medical | subscription |
          other
status: upcoming | scheduled | paid | overdue | held | failed
pastDueAmount          // 0 if current
autopay: on | off | confirm
fromAccountId          // designated checking
```

Credit-card statement and loan installment are Bills **and** Debts. The bill row is the payment due this cycle. The debt row is the balance.

### 4.3 Debt

```
id
kind: card | installment | mortgage | other
billId?                // linked bill row
balance
minimumDue
statementBalance?      // cards
apr?                   // optional; never invent
dueDate
pace: Pace             // see §8
```

```
Pace:
  herAmount(Decimal)
  ownAmount(Decimal)
  statement
  minimumThisCycleOnly   // expires at end of this cycle; next cycle she asks again
  unset                  // first-run / new cycle → must Decide
```

`unset` is the default for a new card. It is **not** minimum.

### 4.4 Accounts

```
id
kind: checking | savings | card
available              // real balance from link or typed
isSpendableSource: Bool   // designated checking
```

Spendable is a **plan number**, not “whatever is in checking.” Checking available is cash-on-hand. The plan decides how much of that cash is allowed to leave.

### 4.5 Goals

```
buffer:
  state: declined | notAsked | active | paused
  target                 // ~2 weeks essentials, or smaller starter
  funded                 // amount actually reserved
  bufferPerPayday        // commitment they accepted; 0 if declined/paused
debtPayoff:
  method: avalanche | snowball | singleCard
  // avalanche if any APR known; else snowball (smallest balance)
```

### 4.6 Plan (compiled output)

```
cycleStart, cycleEnd
incomeThisCycle
essentialsThisCycle
arrearsThisCycle
spendable               // HEADLINE. money that can leave without breaking the plan
hasDebt: Bool           // any card or installment / mortgage-as-debt besides housing bill
buckets:
  bills
  bufferGoal            // hide row if declined / notAsked
  bufferFunded
  flexible              // same dollars as spendable; optional detail
  debtExtra             // hide row if !hasDebt
cardPaces: [Debt.id: Pace]
autopaySet: [Bill.id: on|off|held]
phase: survive | current | debtExtra | buffer
shortfall: Decimal?     // nil if covered
status: empty | waitingOnYou | proposed | live | catchingUp | blocked
revision: Int              // increments on every compile
compiledAt: Date
change: PlanChange?        // last delta, for Home / Decide copy
```

Human choices that survive a recompile (do not wipe these unless they expire or the human changes them):

```
card Paces that have not expired
buffer.state + target + bufferPerPayday commitment
bill rank overrides
pausedBills (catch-up)
designated checking
```

Numbers that do **not** survive a recompile: leftover, spendable, bucket dollars, shortfall, her recommended card amount, autopay held/on for this cycle. Those are outputs. Recompute them.

### 4.7 Household snapshot (runtime)

Never seed with Anthony. Empty snapshot:

```
incomeStreams = []
bills = []
debts = []
accounts = []
goals.buffer.state = notAsked
plan.status = empty
```

---

## 5. Priority — what “essential” means

Consequence rank, highest first. Ties broken by due date (sooner first), then amount.

| Rank | Class | Examples | Miss cost |
|---|---|---|---|
| 1 | Housing | rent, mortgage | eviction / foreclosure path |
| 2 | Shutoff utility | electric, gas, water | shutoff |
| 3 | Work transport | auto loan, auto insurance, required transit | cannot get to work |
| 4 | Required insurance | health premium, renters if required | lapse |
| 5 | Court / care | child support, required childcare | legal / job |
| 6 | Debt minimum | card min, installment min | default / penalty APR |
| 7 | Work telecom | phone / internet if they said it is required | job risk |
| 8 | Other fixed | storage, memberships they marked keep | fee |
| 9 | Flexible | streaming, extras, optional apps | none this week |

Ranks 1–7 = **essentials** for cover-test and catch-up.  
Rank 6 minimums are essentials. Rank 6 **extra** is Debt extra — not essential.  
Ranks 8–9 can be paused in catch-up.

User can override a single bill’s rank in bill detail (“this one can wait” / “this one is required”). Override is a human choice, stored, shown in plain language.

---

## 6. Cycle math

### 6.1 Pick the cycle

```
primary cadence = most recent recurring IncomeStream cadence
if no income: cycle = next 14 days, plan.status = waitingOnYou

cycleStart = today (start of local day)
cycleEnd   = next payday date
             if next payday < 3 days away, extend to the payday after that
             so the plan always covers at least one incoming check
             when the household is biweekly
```

Primary phrase in UI: **until next payday.** Optional secondary: “about $Y this week” only if the cycle is longer than 9 days. Do not lead with two competing spendable numbers.

### 6.2 Income this cycle

```
incomeThisCycle =
  sum of IncomeStream.amount whose nextDate is in [cycleStart, cycleEnd]
  + linked deposits already landed in the cycle
  + manual “expected this cycle” the human typed
```

Do not multiply weekly pay by 4.3 and call it a month unless the human asked for a monthly view. Core runs on the real next check.

### 6.3 Bills this cycle

A bill belongs in the cycle if:

- dueDate is in the cycle, or
- it is overdue (include `pastDueAmount` + any new cycle amount), or
- autopay is scheduled in the cycle

Variable bills: use last known amount, labeled “typical.” Do not autopay without confirm.

### 6.4 Cash on hand

```
cash = designated checking.available
```

If they typed income but have no account link, cash is unknown. Plan can still propose. Autopay stays **off** until a designated checking account exists. Copy: “I can build the plan. I cannot pay until a checking account is linked.”

---

## 7. Plan compiler

Run in this order. Stop and emit a Decide / empty state when a gate fails.

### Step A — Enough inputs?

```
if incomeStreams.isEmpty OR bills.isEmpty:
  plan.status = empty or waitingOnYou
  spendable = nil
  stop
```

### Step B — Cover test (essentials only)

```
essentialsDue = sum of rank 1–7 amounts due this cycle
                including card/loan MINIMUMS
                excluding debt extra
                excluding buffer
                excluding rank 8–9

arrears = sum of pastDueAmount on rank 1–7

need = essentialsDue + arrears
have = incomeThisCycle + max(cash, 0)

if have < essentialsDue:          // cannot cover this cycle even ignoring arrears
  phase = survive
  shortfall = essentialsDue - have
  run catch-up compiler (§9)
  spendable = 0
  flexible = 0
  debtExtra = 0
  buffer contribution = 0
  plan.status = catchingUp or blocked

else if arrears > 0:
  phase = survive or current-in-progress
  run catch-up compiler
  // catch-up may still leave a leftover; if so continue to C

else:
  leftover = incomeThisCycle - essentialsDue
  // cash is a timing buffer, not extra income. Do not add cash into leftover
  // or she will over-commit money that is already spoken for.
  continue to C
```

**Why cash is not added to leftover:** leftover is what this cycle’s income can fund after essentials. Cash-on-hand is used for **timing** (pay Tuesday before Friday’s check) and for catch-up. Mixing them invents spendable.

### Step C — Leftover first (the better path)

Do not hide a survival floor or skim 70% to debt before they see the number. Paycheck-to-paycheck people need the honest remainder.

```
leftover = incomeThisCycle - essentialsDue
           (after catch-up amounts already assigned to this payday, if any)

if leftover < 0:
  leftover = 0
  // shortfall already handled in B / §9
```

Copy:

> “Until next payday, bills take $X. That leaves $Y.”

`$Y` is leftover. After commitments (if any), spendable is the number they live on. Show spendable large.

If they have a card and leftover is $0, she still asks. Her recommended extra may be $0. Copy: “Nothing left after bills this payday. I will not pull extra from money you don’t have.”

If they have **no card and no loan**, skip every card sentence. Leftover becomes spendable as soon as buffer is asked (accepted or declined).

### Step D — Commitments, not a secret split

Commitments are optional and only offered when they apply:

1. **Card extra this cycle** — only if `hasDebt` (a card or loan that takes extra). Four options (§8).  
2. **Buffer per payday** — only if they opt in. Stored as `bufferPerPayday`.

```
debtExtra = extra implied by stored Pace
            if Pace is unset: debtExtra = 0 in the live plan until they answer Decide
            herRecommendedExtra is computed (§8.2) for the Decide, not auto-applied

bufferContribution = buffer.state == active ? min(bufferPerPayday, leftover - debtExtra, target - funded) : 0
                     if funded >= target: 0

if debtExtra + bufferContribution > leftover:
  do not silently cut buffer to save the card extra or vice versa
  live plan holds both autopay extras
  queue Decide (plan break) — §7A hard/ask
else:
  spendable = leftover - debtExtra - bufferContribution
```

On first-run propose:

- Always show **Spendable** (or leftover, then spendable once asks are answered) as the large number  
- Card ask **only if** a card/loan extra exists  
- Buffer ask always (opt-in)  
- Confirm  

No debt + buffer declined → spendable = leftover. That is a valid live plan.

Plan-edit changes commitments (pace if any, buffer per payday, pause buffer).

### Step E — Spendable (headline)

```
spendable = leftover - accepted debtExtra - accepted bufferContribution
// no debt → debtExtra = 0
// buffer declined → bufferContribution = 0
// both gone → spendable = leftover
```

This number is the point of Core for a lot of people: **what can I spend until next payday.**

- Home: large spendable  
- Plan: same number on top  
- Pay: sends only from spendable  
- Ask “Can I afford this?”: compare to spendable  

Home line with no debt and no buffer:

> “$Y until next payday. Bills are covered. That number is yours.”

Home line with commitments:

> “After bills [and the card extra / buffer]. $Y can leave without breaking the plan.”

If designated checking.available < spendable, keep spendable visible **and** caution: “Checking has $X. I will not send more than cash.”

If designated checking.available < spendable, show spendable as the plan number **and** a caution: “Checking has $X. Spendable is $Y on paper — I will not send more than cash.”

### Step F — Autopay set

```
for each bill:
  if amount is fixed AND rank <= 7 AND checking exists AND cash path is safe:
    autopay = on
  if card:
    autopay amount = chosen Pace (see §8), never silent minimum
  if variable or rank >= 8:
    autopay = confirm or off
  if paying it would overdraft checking:
    autopay = held → Decide
```

### Step G — Phase chip

```
if shortfall or arrears: phase = survive / catchingUp
else if hasDebt and any card pace is minimumThisCycleOnly or unset: phase = current
else if debtExtra > 0: phase = debtExtra
else if buffer active and funded < target: phase = buffer
else: phase = current   // bills covered, spendable is the product
```

Do not show phase names in UI unless they are plain: “Behind” · “Current” · “Paying extra on the card” · “Building a buffer.”  
No-debt current is not a lesser plan. Copy can just be current + spendable.

---

## 7A. Living plan — what can change

The plan is a living set of rules. First-run confirm is permission to **start**. It is not a contract that next month looks like this month.

When facts change, she recompiles. She does not wait for a new onboarding. She does not keep paying last cycle’s $400 extra if leftover is now $40.

### 7A.1 Three kinds of change

| Kind | She does | Human sees |
|---|---|---|
| **Quiet** | Recompile. Update spendable, buckets, schedule. Home “taken care of” can mention it. | No Decide. Optional one-line on Home. |
| **Ask** | Recompile a **proposal**. Queue one Decide. Keep the old live rules until they answer, except where cash path is unsafe — then **hold** autopay. | Decide, one at a time. |
| **Hard stop** | Hold payments that would overdraft or skip an essential. Say the shortfall. | Decide immediately. Spendable = 0 if essentials uncovered. |

Stale-plan rule: if a Decide has been sitting and the inputs moved again, discard the old proposal and queue a fresh one. Never ask them to approve dollars that are no longer in the account.

### 7A.2 Quiet (she changes the plan, no permission needed)

- Paycheck lands on the date she already had — same amount  
- Bill marked paid; upcoming list moves  
- Buffer funded ticks up from the existing contribution rule  
- Card extra capacity shrinks because they spent on the card — her *next* recommend changes; current stored pace still applies this cycle unless cash-unsafe  
- New cycle starts and stored pace is still `herAmount` / `ownAmount` / `statement` (not expired) — dollars may change, the rule stays  
- Rank 9 subscription they already marked ignore  
- Spendable this week drifts because days-in-cycle math moved, but cover test still passes  

Home line examples:

> “Paycheck routed. Spendable this cycle is $410.”  
> “Electric posted at $132, not $140. Plan updated.”

### 7A.3 Ask (plan wants to change a rule)

Queue Decide. Do not silently change the rule.

| Trigger | Decide | Why a human |
|---|---|---|
| New statement cycle | card pay-more | extra vs min vs statement is a choice |
| `minimumThisCycleOnly` expired | card pay-more | lock forbids quiet min |
| Income down enough that her stored extra no longer fits leftover after survival floor | card pay-more + plan break | old $400 would steal rent |
| New recurring debit looks like a bill | audit | add to plan or ignore |
| Known bill amount jumps > 15% or > $25 | bill | confirm new typical |
| They tap Plan edit and change buffer / card pace | plan-edit, then live | they initiated it |
| Catch-up completed — extras can resume | card pay-more (if pace unset) | debt extra was paused |
| They ask to pause buffer, cut a bill, or break spendable for a send | buffer / plan / Pay confirm | they are spending the plan |
| Housing or pay cadence changes (new rent, new job schedule) | plan | cover test may flip |

Plan-edit (`plan-edit.html`) is the standing door. They can change buffer and card four-options (if they have debt) without re-onboarding. Spendable always recalculates on screen.

### 7A.4 Hard stop (she will not keep running the old plan)

- Checking cannot cover an autopay due in the window without overdraft → hold + Decide  
- Income + cash cannot cover rank 1–5 this cycle → catch-up / blocked copy  
- Linked payroll missing on expected payday → do not invent the check. Hold non-essentials. Ask.  
- They disable designated checking → autopay off. Plan rules can stay; execution stops.

### 7A.5 What she must not do when changing the plan

- Do not wipe buffer opt-in because leftover shrank. Pause **contribution** if pool is gone; keep the goal unless they decline or pause it.  
- Do not flip a card to minimum because the cycle turned. Ask.  
- Do not resume debt extra during approved catch-up until arrears on rank 1–7 are cleared (or they override).  
- Do not raise Flexible by inventing income.  
- Do not require them to walk onboard-connect again just because rent changed. Edit the bill, recompile.  
- Do not stack five Decides. One at a time. Priority: hard stop → catch-up → card → audit gap → buffer.

### 7A.6 Who can change what

| Actor | Can change | Cannot |
|---|---|---|
| Compiler | Output dollars, phase, held autopay, her *recommended* amount | Stored Pace, buffer.state, bufferPerPayday, rank overrides |
| Human via Decide / Plan edit | Pace, buffer, split, rank, pause a bill, approve catch-up | Invent income |
| Autopay adapter | Mark paid / failed / held | Change rules |
| Ask | Same as Plan edit, through conversation | Pay a bill that would overdraft |

### 7A.7 Copy when the plan moved

Quiet: “The plan updated. Same rules. New numbers.”  
Ask: “This cycle does not support the last card extra. I need a choice.”  
Hard: “I held the internet payment. Checking would go negative. The plan cannot run as-is.”

---

## 8. Card pay-more

Skip this entire section when the household has no card and no loan that takes a payment above a fixed installment already in Bills. Do not show Debt extra. Do not queue card Decide. Do not put a card chip on Ask.

### 8.1 When she asks (only if hasDebt)

- First-run plan propose  
- Every new statement cycle for each card  
- Plan edit  
- Ask: “What should I pay on the card?”  
- Audit if the stored pace expired (`minimumThisCycleOnly` always expires)

### 8.2 Recommended amount (her amount)

Her recommend is computed from **leftover**, not from a hidden skim. It is a proposal. It does not become live debtExtra until they accept a Pace.

```
cap = min(
  leftover,                                  // never recommend more than leftover
  sum over cards of (statement - minimum)    // or balance - minimum
)

if leftover < 25:
  herRecommendedExtra = 0
else:
  herRecommendedExtra = min(roundTo1(leftover * 0.25), cap)
  if herRecommendedExtra < 10: herRecommendedExtra = 0
```

25% of leftover is a starting propose — conservative on purpose so groceries still exist. They can pick own amount or statement. She does not auto-apply 70%.

Then allocate `herRecommendedExtra` across cards.

**Allocation**

1. If any card has known APR: **avalanche** — highest APR first until that card’s extra capacity (`statement - minimum`, or `balance - minimum` if no statement) is filled, then next.  
2. Else: **snowball** — smallest balance first.  
3. Due-this-week cards get their **minimum** first (already in essentials). Extra is separate.

```
herPayment(card) = minimum(card) + extraAllocated(card)
```

Round extra to whole dollars. Minimum extra worth showing as a distinct “her amount” is $10. Below that, her amount may equal minimum and the sentence must explain the floor.

### 8.3 What she says (no fake APR miracles)

Allowed, if APR is present:

> “Sapphire minimum is $240. I recommend $400 this cycle — $160 extra from what’s left after bills. At 24.99% APR, extra now cuts principal instead of sitting on the balance. That is not a payoff date. It is this cycle’s payment.”

Forbidden:

- “You’ll be debt-free by March.”
- “This saves you $2,411 in interest.” as a bare claim with no APR
- Invented APR
- Showing a payoff date built on assumed future extras they have not confirmed

If APR is missing:

> “Minimum is $240. I recommend $400 — $160 extra from spendable after bills. I don’t have this card’s APR, so I will not project interest.”

### 8.4 Four options (UI lock)

1. **Her amount** — primary  
2. **Own amount** — stepper / keypad, floor = $0 extra (which is minimum), cap = statement or balance  
3. **Statement** — full statement balance if known  
4. **Minimum this cycle only** — discouraged. Subcopy: “Only this cycle. I will ask again.”

Choosing 4 stores `minimumThisCycleOnly` with `expiresOn = cycleEnd`. Next cycle pace becomes `unset` and she asks again.

### 8.5 Multiple cards

One Decide can cover one card (simpler, matches `decide-card-paymore`). If two cards cycle the same week, queue two Decides, highest APR (or highest minimum) first. Do not hide the second.

---

## 9. Catch-up compiler

Triggered when any rank 1–7 bill has `pastDueAmount > 0` or status `overdue`.

### 9.1 Output

A **sequence**, not a list:

```
steps: [
  { when: today | paydayDate, billId, amount, kind: full | partial | skip },
  ...
]
flexibleCutPerWeek
pausedBills: [id]          // rank 8–9
debtExtraPaused: Bool      // true until essentials current
humanChoicesNeeded: [...]
honestShortfall: Decimal?
```

### 9.2 Build the sequence

```
protectNextEssentials()
  // bills rank 1–7 due before or on next payday that are not yet overdue
  // these stay reserved; catch-up cannot steal them

availableNow = max(cash - reservedUntilNextPayday, 0)
availableNext = income on next payday - essentials due that cycle

queue = overdue bills sorted by rank, then shutoff date if known, then amount

for each bill in queue:
  if availableNow >= bill.pastDue:
    pay full today from availableNow
  else if bill allows partial AND availableNow >= min(availableNow, $50):
    partial today; remainder scheduled on next payday
  else:
    schedule on next payday if availableNext covers it
    else mark humanChoice: call / arrangement / which bill to protect
```

Debt extra pauses while `arrears > 0`. Card minimums stay in essentials.

### 9.3 When income cannot cover essentials

```
if availableNow + availableNext + later known checks in a 30-day window
   < rank 1–5 essentials in that window:

  plan.status = blocked   // still a plan, not an empty screen
  copy:
    "Income does not cover housing and utilities even if we pause extras.
     I will not invent the difference.
     Protect [list rank 1–3].
     Call [payee] before the shutoff / late date.
     I can keep minimums on the calendar and cut Flexible to $0."
```

She may draft a **call script** in Ask / Decide (dates, amount owed, what they can offer from the real sequence). She does not pretend the creditor accepted it.

### 9.4 Decide options (`decide-catchup`)

- Approve her sequence  
- Adjust priorities (reorder / mark a bill waitable)  
- Change partials  
- Not now  

Not now ≠ she forgets. Bills hub stays on “overdue · catch-up waiting.”

---

## 10. Buffer (psychology + math)

### 10.1 Target

```
essentialsPerWeek = (rank 1–7 typical monthly equivalent) / 4.3
fullTarget = roundTo10(essentialsPerWeek * 2)     // ~2 weeks
starterTarget = roundTo10(essentialsPerWeek * 1)  // ~1 week
tinyTarget = min($100, fullTarget)                // first win
```

Ask order on first run: full · starter · not now.  
Plan-edit can add tiny later. Do not shame $0.

When they accept a target, also set a **per-payday commitment** they can see and edit:

```
suggestedBufferPerPayday = min(roundTo10(target / 8), leftover * 0.10, leftover)
if suggestedBufferPerPayday < 10: suggestedBufferPerPayday = 0
```

They can accept that, type their own, or decline. Stored as `bufferPerPayday`.

### 10.2 Funding

Only from `bufferContribution` in §7, and only if `state == active` and `bufferPerPayday > 0`.  
Funded cash should live in designated checking with a ledger reserve (virtual bucket), not a second bank account in v1.

Guardrail “don’t break buffer without Decide” applies **only when** `state == active AND funded > 0`.

If they spend the reserved dollars, funded decreases. She does not invent it back.

### 10.3 Copy

> “Want to endeavor on a buffer? About two weeks of essential bills ($X) as a goal — not cash I assume you already have.”

Decline:

> “Floor is $0. I will not invent buffer cash. You can start this later from Plan.”

---

## 11. Onboarding state machine

Progressive. Not a 12-step wizard. Two paths, same compiler.

Screens (already in the map — implement these, do not add a seventh onboard page):

| State | Shell | Exit condition |
|---|---|---|
| `start` | `onboard-connect` | chose link or manual |
| `capture` | `onboard-income-expenses` | ≥1 income AND ≥1 bill |
| `audit` | `onboard-audit` | user taps propose (gaps do not block) |
| `propose` | `onboard-plan-propose` | buffer asked; card pace chosen **only if hasDebt** |
| `confirm` | `decide-plan-confirm` | Confirm & run |
| `live` | Home + Plan | engine running |
| `catchup` | `decide-catchup` | if audit found arrears; can happen before or after confirm |

### 11.1 Connect (`onboard-connect`)

Copy lock:

> Start with accounts — or type it in.  
> She never invents numbers.

Paths:

- Link: checking (required for autopay), payroll / deposits (income), cards + loan accounts (bills/debts).  
- Manual: net pay + cadence + next pay date + bill list (payee, amount, due, priority).  
- Banks can connect later. Manual plan is valid.

Still-needed chips: Income · Expenses · Plan confirm.

### 11.2 Capture (`onboard-income-expenses`)

- Net pay preferred. If they type gross, label it Gross and do not treat it as spendable cash.  
- Cadence: weekly · biweekly · semimonthly · monthly · irregular.  
- Each bill: amount, due window, priority.  
- Cards: minimum + balance + statement if they have it + APR optional.  
- Empty: “No bills yet.” Do not fill example rows.

### 11.3 Audit (`onboard-audit`)

Three columns in substance, not jargon:

- **Covered** — income found, essentials on the list, checking designated  
- **Missing** — likely gaps (no housing row, no utility, insurance). Suggestions only. Will not block propose.  
- **Late** — overdue rows → catch-up will run at propose

If nothing to audit yet: “Waiting on income and a bill list.”

### 11.4 Propose (`onboard-plan-propose`)

Must include, in this order:

1. Income this cycle · expenses this cycle · spendable  
2. **Ask · card** — her amount + four options  
3. **Ask · buffer** — full / starter / not now  
4. Autopay set preview (fixed essentials on; cards show chosen pace)  
5. If behind: catch-up summary + link into `decide-catchup` before confirm

Two visual variants already exist: buffer accepted vs declined. Keep both.

### 11.5 Confirm (`decide-plan-confirm`)

One human gate:

- Confirm & run  
- Adjust a rule (back to plan-edit / propose)  
- Not now  

After confirm: `plan.status = live` (or `catchingUp` if sequence approved). Home becomes quiet proof. She may pay.

Confirm does **not** freeze the plan. They do not re-onboard to change rent, hours, or a card pace. Plan edit + recompile. See §7A.

### 11.6 Trust rules for first-run

- Show what she read (payee names, amounts) before she proposes.  
- No progress-bar theater.  
- No “we found $12,400 you can save.”  
- Linking is optional. Manual is first-class.  
- If link fails: stay on manual. Do not dead-end.

---

## 12. Continuous run loop (after live)

Cadence:

| Trigger | What she does |
|---|---|
| Daily quiet | upcoming / paid / overdue; spendable drift; card pace expiry |
| Payday lands | recompile; route income to bills + paces + buffer + spendable |
| Bill due window (T-3 through due) | confirm cash path; hold + Decide if short |
| New debit looks like a bill | audit finding → Decide to add |
| Autopay fail | Decide + retry |
| User opens Ask | answer from live plan only |
| User edits plan | recompile; stored Pace / buffer / split stay unless they changed them |
| Facts move (see §7A) | quiet update, or replace any stale Decide with a fresh proposal |

Home:

- Quiet Current Status when nothing needs them  
- Needs you = one Decide at a time  
- Handled = “Water paid · paycheck routed.” Not a social feed.  
- If the plan quietly recompiled: one line, not a feed. “Plan updated. Same rules. New numbers.”

---

## 13. Decide catalog (Core only)

| Type | Shell | Human must choose |
|---|---|---|
| Plan confirm | `decide-plan-confirm` | run / adjust / not now |
| Card pay-more | `decide-card-paymore` | her / own / statement / min this cycle |
| Catch-up | `decide-catchup` | approve sequence / adjust / partials / not now |
| Bill fail / jump / held | `decide-bill` | retry / partial / skip / move money |
| Audit gap | `decide-audit` | add bill / ignore this once |
| Plan break | `decide-plan` | cut flexible / delay / change rule |
| Buffer | `decide-buffer` | skip / partial / move / delay — only if goal active + funded |

No trading, no rebalance, no Misfits in this catalog.

---

## 14. Ask — plan-grounded

v1 chips (already locked):

- Can I afford this?  
- Why didn’t that bill pay?  
- What should I pay on the card? *(hide if no debt)*  
- How do we get current?  
- What can I spend until next payday?

Add only if they stay grounded in the live plan (ideas, not extra screens):

- What is spendable this week?  
- What gets paid next?  
- Are we behind?  
- What did you pause?  
- Start a buffer / change the buffer  
- What happens if this check is late?  
- What changed in the plan?

Answers must cite plan numbers. If a number is missing: “I don’t have that yet.” Never fill with a demo figure.

---

## 15. Copy deck (use these shapes)

**Empty**  
“Waiting on income and expenses. I don’t invent numbers.”

**Propose**  
“Built from what you entered and what landed.”  
With debt: “Two asks before I run.”  
No debt: “Spendable is $Y until next payday. One ask on the buffer — or confirm now.”

**Spendable**  
“$Y until next payday. After bills. That number is yours.”  
With commitments: “After bills and what you already committed. $Y can leave without breaking the plan.”

**Card**  
“Pay more than minimum? I recommend $X this cycle (+$Y over min) from what’s left after bills — toward the balance, not a quiet minimum.”

**Buffer**  
“A goal to endeavor on. Not cash I assume you already have.”

**Catch-up**  
“You’re behind $X across N bills. Here is a sequence from this paycheck and the next. I will not invent the rest.”

**Cannot cover**  
“Even if we pause extras, income does not cover housing and utilities. I won’t pretend it does.”

**Wealth / later**  
“Core is bills, spendable, and debt extra. Investing is a later tier. I will not project returns here.”

**Plan changed (quiet)**  
“The plan updated. Same rules. New numbers.”

**Plan changed (ask)**  
“This cycle does not support the last card extra. I need a choice.”

**Plan changed (hard)**  
“I held that payment. Checking would go negative. The plan cannot run as-is.”

---

## 16. Fixtures (tests only — never empty-state defaults)

Use these in unit tests for the compiler. Do not preload them in the app.

### Fixture A — Tight but current (the common case)

```
income: $1,920 net biweekly, next payday in 6 days
cash: $410
bills this cycle:
  rent 820  rank 1
  electric 140 rank 2
  auto ins 95 rank 3
  phone 68 rank 7
  card min 75 rank 6  (balance 2,400, statement 310, APR 22.99)
  streaming 16 rank 9
arrears: 0
buffer: notAsked
```

Expect:

- essentials ≈ 820+140+95+68+75 = 1,198  
- leftover ≈ 1,920 − 1,198 = 722  
- her recommended extra ≈ 25% of leftover, capped under leftover (about $180), not 70%  
- until they accept a Pace, live debtExtra = 0  
- spendable after they accept her amount ≈ leftover − extra  
- streaming not essential  
- no catch-up  
- propose shows leftover first, then buffer + card asks

### Fixture B — Behind on utilities

```
same income
cash: $60
electric pastDue 180 + current 140
phone pastDue 94
rent due in 11 days 820
```

Expect:

- catch-up sequence  
- debt extra paused  
- flexible cut  
- Decide catch-up  
- she does not pay streaming first

### Fixture C — Cannot cover housing

```
income: $1,100 biweekly
rent 1,450 monthly due this cycle
utilities 200
cash: $40
```

Expect:

- shortfall stated plainly  
- plan.status blocked or catchingUp with honestShortfall  
- no invented second job  
- protect housing copy  
- spendable = 0

### Fixture D — Manual only, no bank

```
typed income + 3 bills, no checking
```

Expect:

- plan can propose  
- autopay all off  
- copy: cannot pay until checking is linked  
- confirm still allowed (rules live; execution waits)

### Fixture E — Buffer declined

```
same as A, buffer declined
```

Expect:

- buffer goal $0  
- no buffer guardrail  
- card ask still required  
- leftover split without buffer skim

### Fixture F — Minimum this cycle only expires

```
pace = minimumThisCycleOnly, cycleEnd yesterday
```

Expect:

- pace becomes unset  
- Decide card pay-more queued  
- autopay does not silently send minimum as the new forever rule

### Fixture G — Plan changes when leftover disappears

```
start from Fixture A live
stored Pace = herAmount $280
next cycle income lands at $1,100 instead of $1,920
rent still 820 + other essentials still due
```

Expect:

- recompile
- do not autopay $280 extra
- hold or shrink to what leftover allows
- queue card / plan-break Decide
- buffer.state unchanged if it was active; contribution may go to $0 this cycle
- revision increments
- they are not sent back through onboard-connect

### Fixture H — Quiet amount change, rules stay

```
live plan, electric typical $140, autopay on
electric posts $132
cover test still passes
```

Expect:

- quiet recompile
- no Decide
- Home may say the plan updated
- autopay rule still on

### Fixture I — No debt, spendable is the product

```
income: $1,920 net biweekly
cash: $410
bills: rent 820, electric 140, phone 68
no cards, no loans
buffer: declined
```

Expect:

- hasDebt = false
- no card ask on propose
- no Debt extra bucket
- leftover = 1,920 − 1,028 = 892
- spendable = 892
- Home / Plan show $892 as the large number
- Ask has no “What should I pay on the card?”
- plan can go live after buffer ask + confirm
- still Core-complete

---

## 17. What Eng should build, in order

Matches `CORE-V1-SCREEN-MAP.md`. Planning engine work sits under these slices:

1. Models + compiler (this file §4–§10 and §7A) with Fixture A–I tests  
2. Onboard connect → capture → audit → propose → confirm  
3. Plan live + plan-edit (leftover, card four options, buffer per payday) — edits recompile, no second onboard  
4. Bills hub with overdue → catch-up, not a static list  
5. Decide: card pay-more, catch-up, bill held  
6. Home handled + Needs you (one at a time)  
7. Ask chips against the live plan  
8. Autopay execution adapter (held if cash unsafe)

Portfolio tab may stay a labeled shell. Do not implement Managed / Misfits / Trading against this engine until Core is live and Sean opens that queue. When those features exist, they consume this plan — they do not fork it.

---

## 18. Acceptance checks

A build is Core-correct when all of these are true:

- [ ] Fresh install shows no Anthony numbers  
- [ ] Plan refuses to compute without income and at least one bill  
- [ ] Card row never stores minimum as the quiet default  
- [ ] Buffer decline → $0 floor, no guardrail  
- [ ] Overdue produces a sequenced catch-up, not only a red list  
- [ ] Shortfall copy admits when income cannot cover essentials  
- [ ] Spendable never exceeds the plan rule, and Pay cannot exceed spendable or cash  
- [ ] Autopay holds instead of overdrafting  
- [ ] `minimumThisCycleOnly` expires and she asks again  
- [ ] No payoff-date or interest-saved claim without a real APR and estimate language  
- [ ] No investing return on Home, Plan, Ask in Core  
- [ ] UI has no “exception type” jargon  
- [ ] After confirm, changing a bill or paycheck recompiles; user is not forced through onboarding again  
- [ ] Stored card extra that no longer fits leftover does not keep autopaying — Decide or hold  
- [ ] Quiet amount changes do not spawn a Decide  
- [ ] Buffer opt-in survives a tight cycle; only the contribution may drop to $0  
- [ ] Spendable is visible on Home, Plan, and Pay  
- [ ] Household with no card/loan has no card ask, no Debt extra row, and a live plan after buffer + confirm  

---

## 19. One paragraph for Ask / store / compliance

Silvia Core helps you put income and bills in one plan, pay fixed essentials on time, and see what you can spend until next payday. If you have a card, she asks whether to pay more than the minimum when money is left. A buffer is optional. No debt is a complete plan. If you are behind, she proposes a catch-up from real income — she does not create money. This is a money-operations tool, not investment advice and not a guarantee you will be out of debt by a date.

---

*Silvia. The financial operating system. Core first.*
