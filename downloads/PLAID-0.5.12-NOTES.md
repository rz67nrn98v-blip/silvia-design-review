# Silvia 0.5.12 — Plaid Link scaffold notes

## APK
- versionName 0.5.12 · versionCode 18
- Target URL: https://design-shells-production.up.railway.app/downloads/Silvia-0.5.12.apk
- Fallback while Railway deploys paused: https://github.com/rz67nrn98v-blip/silvia-design-review/releases/download/silvia-android-0.5.12/Silvia-0.5.12.apk

## Plaid API base
- BuildConfig.PLAID_API_BASE = https://design-shells-production.up.railway.app
- Health: GET /plaid/health (also GET /health)
- Routes: POST /link/token/create, POST /item/public_token/exchange, GET /item/accounts, GET /item/transactions, POST /item/disconnect
- Standalone repo (for dedicated silvia-plaid service when creates unpause): https://github.com/rz67nrn98v-blip/silvia-plaid-api

## CoS blockers (exact)
1. **Unpause Railway deploys** for Silvia Design Review production (dashboard Resume/Unpause). Until then, design-shells stays on 0.5.11 nginx image — APK 0.5.12 and Plaid routes are not live on railway.app.
2. After unpause: deploy commit `1c07e53` (or later main) to **design-shells**. Set domain targetPort to container PORT (Railway-injected; Dockerfile EXPOSE 8080). Enable auto-deploy if desired.
3. Set Railway vars on design-shells (or future silvia-plaid service):
   - `PLAID_CLIENT_ID` = sandbox client id
   - `PLAID_SECRET` = sandbox secret
   - `PLAID_ENV=sandbox` (already staged/set as name)
4. Optional: create dedicated Railway service `silvia-plaid` from `rz67nrn98v-blip/silvia-plaid-api` once creates are unpaused; then bump APK BuildConfig.PLAID_API_BASE to that domain.

## Sean sandbox how-to (once keys live)
1. Install 0.5.12 APK
2. Home → Set up your plan → Link accounts
3. Plaid Link opens → choose **First Platypus Bank** (sandbox)
4. Username `user_good` · password `pass_good`
5. Select accounts → continue
6. Onboard income/bills may be prefilled from recurring detection — confirm, never invent
7. Propose → confirm plan (leftover-first PlanEngine)

Until keys are set, Link shows honest **“Bank link isn’t set up yet”**. Manual path still works. DEBUG Eng shells → “Preview linked mapping” uses Eng-only sample JSON (not live Link).
