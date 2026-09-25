# Silvia Core — Plan model (v1)

**Not financial advice.** Product rules for how Core builds and runs a household money plan.  
**Job:** Get people on track, pay bills on time, manage money. Foundation for wealth creation. Later tiers add investing / access / full Autopilot.

---

## One sentence

Silvia learns **income** and **expenses**, builds a **plan**, **auto-pays bills inside that plan**, and only pulls the human when something breaks the rules.

---

## Inputs (required)

| Input | How it arrives | Notes |
|---|---|---|
| **Income** | Linked payroll / deposits, or user-stated net pay + cadence | Net after tax preferred; if gross, label it |
| **Recurring expenses** | Linked bills + subscriptions + detected debits | Each has amount, due window, priority |
| **Accounts** | Checking / savings / cards | Spendable lives on checking (or designated) |
| **Debts** | Cards, loans — balance, minimum due, due date, APR if known | Cards never treated as “minimum forever” |
| **Goals (asked, not assumed)** | Buffer endeavor, debt payoff pace, “no overdraft” | Empty goals OK — she asks; she does not invent that people already have a buffer |

Without income **or** expenses, plan stays **empty / Waiting on you** — never invent numbers.

---

## What the plan is

A living set of rules, not a spreadsheet screenshot:

1. **Spendable** — money that can leave without breaking bills and chosen goals  
2. **Bill schedule** — what gets paid, from where, by when (autopay on/off per bill)  
3. **Buckets** — simple Core set only:  
   - Bills  
   - Buffer *(goal — only if they opted in)*  
   - Flexible (day-to-day)  
   - Debt extra *(for card/loan amounts above minimum)*  
4. **Guardrails** — never miss a priority bill; never silently overdraft; never leave a card on minimum-only without asking

---

## Build sequence (first-run)

1. Connect accounts (or manual income + bill list)  
2. **Audit** — what’s covered, what’s missing, what’s late  
3. Propose plan: spendable + bill autopay set  
4. **Ask two Core questions** (Decide / onboarding — not buried):  
   - **Cards:** Pay more than minimum? Silvia recommends an affordable amount over minimum toward debt. Options: her amount · pick your own · statement balance · minimum this cycle only (discouraged, must be explicit)  
   - **Buffer:** Want to build toward ~2 weeks of essential bills? It’s a **goal to endeavor on**, not something we assume they already have. Options: start the goal · smaller starter goal · not now  
5. Human confirms plan once → she runs it  
6. Home shows quiet “taken care of”; Decide only on exceptions

---

## Credit cards (locked)

**Nobody should default to minimum-only.** Minimum alone is a trap path.

- Every card payment cycle: she **asks** whether to pay more than the minimum.  
- She **recommends** an amount over the minimum they can afford from spendable (after essential bills), aimed at getting out of debt — not an invented return, just a concrete payment.  
- User can: accept her amount · set their own · pay statement balance · choose minimum **this cycle only** (must be an explicit choice, never the quiet default).  
- Autopay rule on the card stores the chosen pace (extra fixed $, % of spendable, or statement).  
- Plan edit and Ask (“What should I pay on the card?”) use the same logic.

---

## Buffer (locked)

**Do not assume people have 2 weeks of extra cash for bills.**

- ~2 weeks of essential bills is a **goal**, not a pre-filled floor they already meet.  
- First-run / plan propose: **ask** if they want to endeavor on building that buffer (or a smaller starter).  
- If they decline: plan runs with **no buffer floor** (or $0 goal) — bills + debt-extra rules still apply; she does not invent buffer cash.  
- If they accept: buffer becomes a funded goal; guardrail “don’t break buffer without Decide” applies only once the goal is active and funded.  
- Home / Plan can show progress toward the buffer goal without shaming empty.

---

---

## Behind on bills / catch-up (locked)

**If they’re behind, Silvia’s job is to get them current** — not only to list what’s overdue.

1. **Audit the arrears** — which bills, how much past due, due next, shutoff/late-fee risk, essentials vs flexible.  
2. **Propose a catch-up path** from real income + spendable (never invent cash):  
   - Prioritize essentials (housing, utilities, transport, insurance, minimums that prevent default)  
   - Sequence payments across this payday and the next  
   - Temporarily cut Flexible / pause non-essentials  
   - Apply any debt-extra / card pay-more only after essentials are protected  
   - Where useful: partial payment now + scheduled remainder (Decide)  
3. **One Decide** when tradeoffs need a human (which bill first, cut X vs Y, call creditor).  
4. **Run the catch-up** — Home “taken care of” tracks progress toward current; Bills shows overdue → catching up → current.  
5. Ask: “How do we get current?” uses the same path.

If income cannot cover essentials even after cuts, she says that plainly and proposes the honest next step (which bills to protect, what to negotiate) — still a plan, not empty shame.

---

## Catch-up / behind (locked)

**If the household is behind on bills, she proposes a path to get current — not only a list of overdue.**

- Detect overdue / past-due from linked bills and stated due amounts (real numbers only — never invent income or cash).  
- **Catch-up plan:** prioritize essentials (housing, utilities, insurance, transport), sequence what to pay first with real spendable + next income, temporary Flexible cuts, and payment arrangements or partials where the bill allows.  
- Surface on Bills (overdue), Audit findings, first-run audit when late items exist, and Ask (“How do we get current?”).  
- Human choice on tradeoffs → **Decide** (`decide-catchup`): approve her sequence · adjust priorities · approve partials / arrangements · not now.  
- She does not silently skip essentials or invent money to “fix” overdue.

---

## Autopay policy (Core)

- **On by default** for fixed-amount essential bills (rent/mortgage, utilities, insurance, loan minimums, essential subscriptions).  
- **Credit cards:** never quiet minimum — see Credit cards (locked).  
- **Off / confirm** for variable or high-variance (medical; one-offs).  
- Pay from **designated checking** only.  
- If cash < bill (+ active buffer goal floor if any) → **Decide** (skip / pay partial / move money / delay) — she does not silently overdraft.  
- Failed rail / returned payment → **Decide** + retry path.

This is “actively managed auto bill pay”: she executes inside rules; she does not gamble the account.

---

## Audit (continuous)

On a cadence (daily quiet check + payday + bill-due window):

- Bills upcoming / paid / overdue  
- Income landed vs expected  
- Spendable drift  
- Subscriptions new or raised  
- Card still on minimum-only without a recent “pay more” choice → prompt again  
- Buffer goal progress (if opted in)

Each finding: one issue → one proposed action → Decide if it needs a human.

---

## Decide (Core exception types only)

| Type | Example |
|---|---|
| Bill fail | Autopay bounced |
| Audit gap | New bill detected, not in plan |
| Plan break | Spendable would go negative / active buffer breach |
| Pay fail | Person-to-person send failed |
| Card pay-more | Each cycle: accept recommend / set amount / statement / minimum this cycle only |
| Catch-up / behind | Approve sequenced path to get bills current |
| Buffer goal | Opt in, change target, or pause the endeavor |

No Trading / Misfits / rebalance decisions in Core.

---

## Pay tab (in Core)

Send / request people (Cash App, Zelle, Venmo) **from spendable**, after essential bills (and active buffer rules) are safe. History lives here. Not a substitute for bill autopay.

---

## Out of Core v1

- Portfolio browse / Trading / overnight invest Autopilot  
- Misfits / alternatives  
- Tax optimization, advice-labeled recommendations, invented returns  
- Complex multi-account treasury

---

## Design / Eng map

| Surface | Job |
|---|---|
| Money · Bills / card detail | Schedule + autopay + **pay-more than minimum** |
| Money · Audit | Gaps and findings |
| Plan / Plan edit | Overview + buffer goal + card pace |
| Onboarding / Decide | Card pay-more ask + buffer endeavor ask + catch-up when behind |
| Home · handled | Quiet proof she ran the plan |
| Home · Needs you / Decide | Exceptions + the two asks |
| Ask | Afford X / Why didn’t X pay / What should I pay on the card / How do we get current |
| Bills · overdue / Decide catch-up | Path to current — sequence, not list-only |

---

## Locked product choices (user · Sep 24 2026)

1. **Buffer:** ~2 weeks essential bills = **opt-in goal**, not an assumed default people already have.  
2. **Credit cards:** never default to minimum-only; always ask to pay more; Silvia recommends an affordable amount over minimum toward debt.  
3. **Behind on bills:** Silvia proposes a catch-up path to bring them **current** — prioritize, sequence, cut flexible spend, Decide on hard tradeoffs; never invent cash.  
4. **First confirm:** one Plan confirm (including those asks), then autopilot; not a tap per every bill.  
5. **Manual households:** allowed — income + bills typed if banks not linked yet.
