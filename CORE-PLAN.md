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
| **Debts (min)** | Cards, loans — minimum due + due date | Full payoff strategy can deepen later |
| **Goals (optional)** | Buffer target, debt snowball, “no overdraft” | Defaults if empty: 2-week buffer + all bills current |

Without income **or** expenses, plan stays **empty / Waiting on you** — never invent numbers.

---

## What the plan is

A living set of rules, not a spreadsheet screenshot:

1. **Spendable** — money that can leave without breaking bills or buffer  
2. **Bill schedule** — what gets paid, from where, by when (autopay on/off per bill)  
3. **Buckets** — simple Core set only:  
   - Bills  
   - Buffer (short-term safety)  
   - Flexible (day-to-day)  
   - *(Later)* Debt extra / Save — not required for v1 ship  
4. **Guardrails** — never miss a priority bill; never drop buffer below floor without Decide

---

## Build sequence (first-run)

1. Connect accounts (or manual income + bill list)  
2. **Audit** — what’s covered, what’s missing, what’s late  
3. Propose plan: spendable + bill autopay set + buffer floor  
4. Human confirms once (Decide or Plan confirm)  
5. She runs it — Home shows quiet “taken care of”; Decide only on exceptions

---

## Autopay policy (Core)

- **On by default** for fixed-amount bills inside the plan (rent/mortgage, utilities, insurance, loans minimums, subscriptions marked essential).  
- **Off / confirm** for variable or high-variance (credit card statement pay-in-full if user chose; medical; one-offs).  
- Pay from **designated checking** only.  
- If cash &lt; bill + buffer floor → **Decide** (skip / pay partial / move money / delay) — she does not silently overdraft.  
- Failed rail / returned payment → **Decide** + retry path.

This is “actively managed auto bill pay”: she executes inside rules; she does not gamble the account.

---

## Audit (continuous)

On a cadence (daily quiet check + payday + bill-due window):

- Bills upcoming / paid / overdue  
- Income landed vs expected  
- Spendable drift  
- Subscriptions new or raised  
- Card utilization spike (flag only in Core; deep payoff = later)

Each finding: one issue → one proposed action → Decide if it needs a human.

---

## Decide (Core exception types only)

| Type | Example |
|---|---|
| Bill fail | Autopay bounced |
| Audit gap | New bill detected, not in plan |
| Plan break | Spendable would go negative / buffer breach |
| Pay fail | Person-to-person send failed |

No Trading / Misfits / rebalance decisions in Core.

---

## Pay tab (in Core)

Send / request people (Cash App, Zelle, Venmo) **from spendable**, after bills + buffer are safe. History lives here. Not a substitute for bill autopay.

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
| Money · Bills | Schedule + detail + autopay toggle |
| Money · Audit | Gaps and findings |
| Plan / Plan edit | Overview + change a rule |
| Home · handled | Quiet proof she ran the plan |
| Home · Needs you / Decide | Exceptions only |
| Ask | “Can I afford X?” / “Why didn’t X pay?” against the plan |

---

## Open product choices (CoS default until user overrides)

1. **Buffer floor default:** 2 weeks of average essential bills (editable).  
2. **Credit cards:** autopay **minimum** by default; “pay statement balance” is an explicit plan rule.  
3. **First confirm:** one Plan confirm, then autopilot; not per-bill confirms.  
4. **Manual households:** allowed — income + bills typed if banks not linked yet.

