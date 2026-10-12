/**
 * Silvia design-shells host + Plaid API.
 * Static HTML under / ; Plaid endpoints at /link, /item, /health (JSON for /health when Accept prefers json or ?plaid=1).
 * Plaid routes mirror silvia-plaid-api so APK can use this base until a dedicated service exists.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const ANDROID_PACKAGE = "com.silvia.app";
const CLIENT_NAME = "Silvia";

const items = new Map();

function env() {
  return {
    clientId: (process.env.PLAID_CLIENT_ID || "").trim(),
    secret: (process.env.PLAID_SECRET || "").trim(),
    plaidEnv: (process.env.PLAID_ENV || "sandbox").trim().toLowerCase(),
  };
}
function plaidHost(plaidEnv) {
  if (plaidEnv === "production") return "https://production.plaid.com";
  if (plaidEnv === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}
function configured() {
  const { clientId, secret } = env();
  return Boolean(clientId && secret);
}
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}
async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}
async function plaidPost(apiPath, body) {
  const { clientId, secret, plaidEnv } = env();
  const res = await fetch(`${plaidHost(plaidEnv)}${apiPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: clientId, secret, ...body }),
  });
  const data = await res.json().catch(() => ({ error: "invalid_plaid_response" }));
  return { ok: res.ok, status: res.status, data };
}
function requireConfigured(res) {
  if (!configured()) {
    sendJson(res, 503, {
      error: "plaid_not_configured",
      message: "PLAID_CLIENT_ID / PLAID_SECRET not set",
    });
    return true;
  }
  return false;
}
function summarizeAccounts(accounts) {
  return (accounts || []).map((a) => ({
    account_id: a.account_id,
    name: a.name,
    official_name: a.official_name ?? null,
    type: a.type,
    subtype: a.subtype,
    mask: a.mask ?? null,
    balances: {
      available: a.balances?.available ?? null,
      current: a.balances?.current ?? null,
      iso_currency_code: a.balances?.iso_currency_code ?? "USD",
    },
  }));
}
function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function mapTransaction(t) {
  return {
    transaction_id: t.transaction_id,
    account_id: t.account_id,
    name: t.name,
    merchant_name: t.merchant_name ?? null,
    amount: t.amount,
    date: t.date,
    pending: t.pending,
    category: t.category ?? null,
    personal_finance_category: t.personal_finance_category ?? null,
  };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * Pull transactions (paginated) with a short PRODUCT_NOT_READY retry — fresh Items
 * often need a few seconds before /transactions/get returns.
 */
async function fetchTransactions(accessToken, days, { retries = 4, waitMs = 2500 } = {}) {
  const start_date = isoDaysAgo(days);
  const end_date = todayIso();
  let attempt = 0;
  for (;;) {
    const out = [];
    let total = null;
    let offset = 0;
    let lastErr = null;
    while (total === null || offset < total) {
      const tx = await plaidPost("/transactions/get", {
        access_token: accessToken,
        start_date,
        end_date,
        options: { count: 500, offset },
      });
      if (!tx.ok) {
        lastErr = tx;
        break;
      }
      const batch = tx.data.transactions || [];
      total = tx.data.total_transactions ?? batch.length;
      out.push(...batch.map(mapTransaction));
      offset += batch.length;
      if (!batch.length || offset >= 1500) break;
    }
    if (!lastErr) return { ok: true, transactions: out, total: total ?? out.length };
    const code = lastErr.data?.error_code;
    if (code === "PRODUCT_NOT_READY" && attempt < retries) {
      attempt += 1;
      await sleep(waitMs);
      continue;
    }
    return { ok: false, status: lastErr.status, error: code || "plaid_transactions_failed", transactions: [] };
  }
}
function summarizeStream(s) {
  return {
    account_id: s.account_id,
    description: s.description ?? null,
    merchant_name: s.merchant_name ?? null,
    frequency: s.frequency ?? null,
    first_date: s.first_date ?? null,
    last_date: s.last_date ?? null,
    predicted_next_date: s.predicted_next_date ?? null,
    average_amount: s.average_amount?.amount ?? null,
    last_amount: s.last_amount?.amount ?? null,
    is_active: Boolean(s.is_active),
    status: s.status ?? null,
    pfc_primary: s.personal_finance_category?.primary ?? null,
    pfc_detailed: s.personal_finance_category?.detailed ?? null,
    transaction_count: Array.isArray(s.transaction_ids) ? s.transaction_ids.length : null,
  };
}
async function fetchRecurring(accessToken, { retries = 0, waitMs = 2500 } = {}) {
  let r = await plaidPost("/transactions/recurring/get", { access_token: accessToken });
  for (let i = 0; !r.ok && r.data?.error_code === "PRODUCT_NOT_READY" && i < retries; i++) {
    await sleep(waitMs);
    r = await plaidPost("/transactions/recurring/get", { access_token: accessToken });
  }
  if (!r.ok) return { recurring: null, error: r.data?.error_code || "plaid_recurring_failed" };
  return {
    recurring: {
      inflow_streams: (r.data.inflow_streams || []).map(summarizeStream),
      outflow_streams: (r.data.outflow_streams || []).map(summarizeStream),
    },
    error: null,
  };
}
/** Liabilities without PII (no addresses / account numbers). Never invents a minimum. */
function summarizeLiabilities(l) {
  const out = [];
  for (const c of l?.credit || []) {
    const purchase = (c.aprs || []).find((a) => a.apr_type === "purchase_apr");
    out.push({
      kind: "credit",
      account_id: c.account_id,
      minimum_payment: c.minimum_payment_amount ?? null,
      next_payment_due_date: c.next_payment_due_date ?? null,
      last_statement_balance: c.last_statement_balance ?? null,
      apr: purchase?.apr_percentage ?? null,
      is_overdue: c.is_overdue ?? null,
      past_due_amount: null,
      last_payment_amount: c.last_payment_amount ?? null,
      last_payment_date: c.last_payment_date ?? null,
    });
  }
  for (const s of l?.student || []) {
    out.push({
      kind: "student",
      account_id: s.account_id,
      minimum_payment: s.minimum_payment_amount ?? null,
      next_payment_due_date: s.next_payment_due_date ?? null,
      last_statement_balance: s.last_statement_balance ?? null,
      apr: s.interest_rate_percentage ?? null,
      is_overdue: s.is_overdue ?? null,
      past_due_amount: null,
      last_payment_amount: s.last_payment_amount ?? null,
      last_payment_date: s.last_payment_date ?? null,
    });
  }
  for (const m of l?.mortgage || []) {
    out.push({
      kind: "mortgage",
      account_id: m.account_id,
      minimum_payment: m.next_monthly_payment ?? null,
      next_payment_due_date: m.next_payment_due_date ?? null,
      last_statement_balance: null,
      apr: m.interest_rate?.percentage ?? null,
      is_overdue: m.past_due_amount != null ? m.past_due_amount > 0 : null,
      past_due_amount: m.past_due_amount ?? null,
      last_payment_amount: m.last_payment_amount ?? null,
      last_payment_date: m.last_payment_date ?? null,
    });
  }
  for (const n of l?.loan || []) {
    out.push({
      kind: "loan",
      account_id: n.account_id,
      minimum_payment: n.next_payment_amount ?? null,
      next_payment_due_date: n.next_payment_due_date ?? null,
      last_statement_balance: null,
      apr: n.interest_rate?.percentage ?? null,
      is_overdue: null,
      past_due_amount: null,
      last_payment_amount: n.last_payment_amount ?? null,
      last_payment_date: n.last_payment_date ?? null,
    });
  }
  return out;
}
async function fetchLiabilities(accessToken) {
  const r = await plaidPost("/liabilities/get", { access_token: accessToken });
  if (!r.ok) return { liabilities: null, error: r.data?.error_code || "plaid_liabilities_failed" };
  return { liabilities: summarizeLiabilities(r.data.liabilities), error: null };
}
/** Accounts + transactions + recurring + liabilities for plan drafts. No tokens in output. */
async function buildItemSummary(accessToken, days = 90, { recurringRetries = 0 } = {}) {
  const accts = await plaidPost("/accounts/get", { access_token: accessToken });
  const accounts = accts.ok ? summarizeAccounts(accts.data.accounts || []) : [];
  const tx = await fetchTransactions(accessToken, days);
  const [rec, li] = await Promise.all([fetchRecurring(accessToken, { retries: recurringRetries }), fetchLiabilities(accessToken)]);
  return {
    accounts,
    transactions: tx.transactions,
    transactions_window_days: days,
    recurring: rec.recurring,
    liabilities: li.liabilities,
    data_status: {
      accounts: accts.ok ? "ok" : accts.data?.error_code || "failed",
      transactions: tx.ok ? "ok" : tx.error,
      recurring: rec.error || "ok",
      liabilities: li.error || "ok",
    },
  };
}

function linkLiabilitiesOn() {
  return (process.env.PLAID_LINK_LIABILITIES || "on").trim().toLowerCase() !== "off";
}
/** Transfer prototype: sandbox ONLY. Never enabled when PLAID_ENV is not sandbox. */
function sandboxTransferOn() {
  return env().plaidEnv === "sandbox" &&
    (process.env.SILVIA_SANDBOX_TRANSFER || "on").trim().toLowerCase() !== "off";
}
function transferSummary(t) {
  if (!t) return null;
  return {
    transfer_id: t.id,
    type: t.type,
    amount: t.amount,
    status: t.status,
    description: t.description ?? null,
    account_id: t.account_id,
    created: t.created ?? null,
    failure_reason: t.failure_reason
      ? { ach_return_code: t.failure_reason.ach_return_code ?? null, description: t.failure_reason.description ?? null }
      : null,
    recurring_transfer_id: t.recurring_transfer_id ?? null,
  };
}
function plaidErr(r, fallback) {
  return {
    error: fallback,
    plaid_error: r.data?.error_code || null,
    plaid_error_type: r.data?.error_type || null,
    message: r.data?.error_message || null,
  };
}
function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}
/** authorization → create. Returns { decision, rationale, transfer } or { error }. */
async function sandboxTransferOnce(stored, { account_id, type, amount, description }) {
  const au = await plaidPost("/transfer/authorization/create", {
    access_token: stored.access_token,
    account_id,
    type,
    network: "ach",
    amount,
    ach_class: "ppd",
    user: { legal_name: "Silvia Sandbox Test" },
  });
  if (!au.ok) return { status: au.status, body: plaidErr(au, "plaid_transfer_authorization_failed") };
  const a = au.data.authorization;
  if (a.decision !== "approved") {
    return {
      status: 200,
      body: {
        sandbox: true,
        decision: a.decision,
        decision_code: a.decision_rationale?.code ?? null,
        decision_message: a.decision_rationale?.description ?? null,
        transfer: null,
      },
    };
  }
  const tr = await plaidPost("/transfer/create", {
    access_token: stored.access_token,
    account_id,
    authorization_id: a.id,
    description: String(description || "Silvia test").slice(0, 15),
  });
  if (!tr.ok) return { status: tr.status, body: plaidErr(tr, "plaid_transfer_create_failed") };
  return { status: 200, body: { sandbox: true, decision: "approved", transfer: transferSummary(tr.data.transfer) } };
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".apk": "application/vnd.android.package-archive",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function serveStatic(req, res, pathname) {
  let rel = pathname === "/" ? "/index.html" : pathname;
  let full = safeJoin(ROOT, rel);
  if (!full) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    full = path.join(full, "index.html");
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(full).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  fs.createReadStream(full).pipe(res);
}

const PLAID_PATHS = new Set([
  "/health",
  "/link/token/create",
  "/item/public_token/exchange",
  "/item/accounts",
  "/item/transactions",
  "/item/disconnect",
  "/item/summary",
  "/plaid/health",
]);

const server = http.createServer(async (req, res) => {
  try {
    const method = req.method || "GET";
    const url = new URL(req.url || "/", "http://localhost");
    let pathname = url.pathname.replace(/\/+$/, "") || "/";

    const isPlaidHealth = pathname === "/plaid/health" || pathname === "/health"
    // Alias /plaid/* → /* for API routes
    if (pathname.startsWith("/plaid/")) {
      pathname = pathname.slice("/plaid".length) || "/";
    }

    if (method === "OPTIONS" && (PLAID_PATHS.has(pathname) || pathname.startsWith("/item") || pathname.startsWith("/link") || pathname.startsWith("/transfer") || isPlaidHealth)) {
      sendJson(res, 200, { ok: true });
      return;
    }

    // JSON health for Plaid — /plaid/health and /health both
    if (method === "GET" && (isPlaidHealth || pathname === "/health")) {
      sendJson(res, 200, {
        ok: true,
        service: "silvia-plaid",
        host: "design-shells",
        plaid_configured: configured(),
        plaid_env: env().plaidEnv,
        android_package_name: ANDROID_PACKAGE,
        items_in_memory: items.size,
      });
      return;
    }

    if (method === "POST" && pathname === "/link/token/create") {
      if (requireConfigured(res)) return;
      const body = await readJson(req);
      const clientUserId = body.client_user_id || `silvia-android-${randomUUID().slice(0, 8)}`;
      const { ok, status, data } = await plaidPost("/link/token/create", {
        user: { client_user_id: clientUserId },
        client_name: CLIENT_NAME,
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
        android_package_name: ANDROID_PACKAGE,
        // Liabilities as an OPTIONAL product: Link still succeeds at banks without it.
        // PLAID_LINK_LIABILITIES=off drops it (e.g. if a production app isn't approved yet).
        ...(linkLiabilitiesOn() ? { optional_products: ["liabilities"] } : {}),
      });
      if (!ok) {
        sendJson(res, status >= 400 ? status : 502, {
          error: "plaid_link_token_failed",
          plaid_error: data?.error_code || data?.error || data,
          message: data?.error_message || "link token create failed",
        });
        return;
      }
      sendJson(res, 200, {
        link_token: data.link_token,
        expiration: data.expiration,
        request_id: data.request_id,
        client_user_id: clientUserId,
      });
      return;
    }

    if (method === "POST" && pathname === "/item/public_token/exchange") {
      if (requireConfigured(res)) return;
      const body = await readJson(req);
      if (!body.public_token) {
        sendJson(res, 400, { error: "missing_public_token" });
        return;
      }
      const ex = await plaidPost("/item/public_token/exchange", { public_token: body.public_token });
      if (!ex.ok) {
        sendJson(res, ex.status >= 400 ? ex.status : 502, {
          error: "plaid_exchange_failed",
          plaid_error: ex.data?.error_code || ex.data,
          message: ex.data?.error_message || "exchange failed",
        });
        return;
      }
      const accessToken = ex.data.access_token;
      const itemId = ex.data.item_id;
      const summary = await buildItemSummary(accessToken, 90);
      items.set(itemId, {
        access_token: accessToken,
        item_id: itemId,
        accounts: summary.accounts,
        institution: body.institution || null,
        updated_at: new Date().toISOString(),
      });
      // Same fields 0.5.12 reads (item_id, accounts, transactions, institution,
      // transactions_window_days) + additive recurring / liabilities / data_status.
      sendJson(res, 200, {
        item_id: itemId,
        institution: body.institution || null,
        ...summary,
      });
      return;
    }

    if (method === "GET" && pathname === "/item/summary") {
      if (requireConfigured(res)) return;
      const itemId = url.searchParams.get("item_id") || "";
      const days = Math.min(180, Math.max(30, Number(url.searchParams.get("days") || 90)));
      const stored = items.get(itemId);
      if (!stored) {
        sendJson(res, 404, { error: "item_not_found" });
        return;
      }
      const summary = await buildItemSummary(stored.access_token, days, { recurringRetries: 3 });
      stored.accounts = summary.accounts;
      stored.updated_at = new Date().toISOString();
      sendJson(res, 200, { item_id: itemId, institution: stored.institution, ...summary });
      return;
    }

    if (method === "GET" && pathname === "/item/accounts") {
      if (requireConfigured(res)) return;
      const itemId = url.searchParams.get("item_id") || "";
      const stored = items.get(itemId);
      if (!stored) {
        sendJson(res, 404, { error: "item_not_found" });
        return;
      }
      const accts = await plaidPost("/accounts/get", { access_token: stored.access_token });
      if (!accts.ok) {
        sendJson(res, accts.status >= 400 ? accts.status : 502, {
          error: "plaid_accounts_failed",
          plaid_error: accts.data?.error_code || accts.data,
        });
        return;
      }
      const accounts = summarizeAccounts(accts.data.accounts || []);
      stored.accounts = accounts;
      stored.updated_at = new Date().toISOString();
      sendJson(res, 200, { item_id: itemId, accounts });
      return;
    }

    if (method === "GET" && pathname === "/item/transactions") {
      if (requireConfigured(res)) return;
      const itemId = url.searchParams.get("item_id") || "";
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") || 90)));
      const stored = items.get(itemId);
      if (!stored) {
        sendJson(res, 404, { error: "item_not_found" });
        return;
      }
      const tx = await plaidPost("/transactions/get", {
        access_token: stored.access_token,
        start_date: isoDaysAgo(days),
        end_date: todayIso(),
        options: { count: 100, offset: 0 },
      });
      if (!tx.ok) {
        sendJson(res, tx.status >= 400 ? tx.status : 502, {
          error: "plaid_transactions_failed",
          plaid_error: tx.data?.error_code || tx.data,
        });
        return;
      }
      const transactions = (tx.data.transactions || []).map((t) => ({
        transaction_id: t.transaction_id,
        account_id: t.account_id,
        name: t.name,
        merchant_name: t.merchant_name ?? null,
        amount: t.amount,
        date: t.date,
        pending: t.pending,
        category: t.category ?? null,
        personal_finance_category: t.personal_finance_category ?? null,
      }));
      sendJson(res, 200, {
        item_id: itemId,
        days,
        transactions,
        total: tx.data.total_transactions ?? transactions.length,
      });
      return;
    }

    if (method === "POST" && pathname === "/item/disconnect") {
      const body = await readJson(req);
      const itemId = body.item_id || "";
      if (itemId) items.delete(itemId);
      sendJson(res, 200, { ok: true, disconnected: itemId || null });
      return;
    }

    // ---- Plaid Transfer SANDBOX prototype (never live payments) ----
    if (pathname.startsWith("/transfer/sandbox")) {
      if (method === "GET" && pathname === "/transfer/sandbox/status") {
        sendJson(res, 200, { sandbox: true, enabled: configured() && sandboxTransferOn(), plaid_env: env().plaidEnv });
        return;
      }
      if (requireConfigured(res)) return;
      if (!sandboxTransferOn()) {
        sendJson(res, 403, { error: "sandbox_transfer_disabled", plaid_env: env().plaidEnv });
        return;
      }
      const body = method === "POST" ? await readJson(req) : {};
      const itemId = body.item_id || url.searchParams.get("item_id") || "";
      const stored = items.get(itemId);
      const needItem = ["/transfer/sandbox/create", "/transfer/sandbox/move", "/transfer/sandbox/recurring"];
      if (needItem.includes(pathname) && !stored) {
        sendJson(res, 404, { error: "item_not_found" });
        return;
      }
      if (method === "POST" && pathname === "/transfer/sandbox/create") {
        const amount = money(body.amount);
        const type = body.type === "credit" ? "credit" : "debit";
        if (!amount || !body.account_id) {
          sendJson(res, 400, { error: "missing_amount_or_account" });
          return;
        }
        const r = await sandboxTransferOnce(stored, { account_id: body.account_id, type, amount, description: body.description });
        sendJson(res, r.status, r.body);
        return;
      }
      if (method === "POST" && pathname === "/transfer/sandbox/move") {
        // Me-to-me: debit FROM account, then credit TO account (two sandbox transfers).
        const amount = money(body.amount);
        if (!amount || !body.from_account_id || !body.to_account_id) {
          sendJson(res, 400, { error: "missing_amount_or_accounts" });
          return;
        }
        const out = await sandboxTransferOnce(stored, { account_id: body.from_account_id, type: "debit", amount, description: "To savings" });
        if (out.status !== 200 || out.body.decision !== "approved") {
          sendJson(res, out.status, { sandbox: true, debit: out.body, credit: null });
          return;
        }
        const inn = await sandboxTransferOnce(stored, { account_id: body.to_account_id, type: "credit", amount, description: "From checking" });
        sendJson(res, inn.status, { sandbox: true, debit: out.body, credit: inn.body });
        return;
      }
      if (method === "POST" && pathname === "/transfer/sandbox/recurring") {
        const amount = money(body.amount);
        const day = Math.min(28, Math.max(1, Number(body.day_of_month || 1)));
        if (!amount || !body.account_id) {
          sendJson(res, 400, { error: "missing_amount_or_account" });
          return;
        }
        const start = new Date();
        start.setUTCDate(start.getUTCDate() + 2);
        const rc = await plaidPost("/transfer/recurring/create", {
          access_token: stored.access_token,
          account_id: body.account_id,
          type: "debit",
          network: "ach",
          amount,
          ach_class: "ppd",
          user: { legal_name: "Silvia Sandbox Test" },
          description: String(body.description || "Autopay test").slice(0, 15),
          idempotency_key: randomUUID(),
          schedule: { interval_unit: "month", interval_count: 1, interval_execution_day: day, start_date: start.toISOString().slice(0, 10) },
        });
        if (!rc.ok) {
          sendJson(res, rc.status, plaidErr(rc, "plaid_recurring_transfer_failed"));
          return;
        }
        const r = rc.data.recurring_transfer;
        sendJson(res, 200, {
          sandbox: true,
          decision: rc.data.decision ?? null,
          recurring_transfer_id: r?.recurring_transfer_id ?? null,
          status: r?.status ?? null,
          next_origination_date: r?.next_origination_date ?? null,
          amount: r?.amount ?? amount,
        });
        return;
      }
      if (method === "POST" && pathname === "/transfer/sandbox/recurring/cancel") {
        const c = await plaidPost("/transfer/recurring/cancel", { recurring_transfer_id: body.recurring_transfer_id });
        sendJson(res, c.ok ? 200 : c.status, c.ok ? { sandbox: true, cancelled: true } : plaidErr(c, "plaid_recurring_cancel_failed"));
        return;
      }
      if (method === "GET" && pathname === "/transfer/sandbox/get") {
        const g = await plaidPost("/transfer/get", { transfer_id: url.searchParams.get("transfer_id") || "" });
        sendJson(res, g.ok ? 200 : g.status, g.ok ? { sandbox: true, transfer: transferSummary(g.data.transfer) } : plaidErr(g, "plaid_transfer_get_failed"));
        return;
      }
      if (method === "POST" && pathname === "/transfer/sandbox/simulate") {
        const ev = ["posted", "settled", "failed", "returned", "funds_available"].includes(body.event_type) ? body.event_type : null;
        if (!ev || !body.transfer_id) {
          sendJson(res, 400, { error: "missing_transfer_or_event" });
          return;
        }
        const req2 = { transfer_id: body.transfer_id, event_type: ev };
        if (ev === "returned" || ev === "failed") req2.failure_reason = { ach_return_code: body.ach_return_code || "R01" };
        const sim = await plaidPost("/sandbox/transfer/simulate", req2);
        if (!sim.ok) {
          sendJson(res, sim.status, plaidErr(sim, "plaid_transfer_simulate_failed"));
          return;
        }
        const g = await plaidPost("/transfer/get", { transfer_id: body.transfer_id });
        sendJson(res, 200, { sandbox: true, simulated: ev, transfer: g.ok ? transferSummary(g.data.transfer) : null });
        return;
      }
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    // Static design host
    serveStatic(req, res, url.pathname === "/" ? "/" : url.pathname);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "internal_error", message: String(err?.message || err) });
  }
});

server.listen(PORT, () => {
  console.log(`silvia design-shells+plaid on :${PORT} configured=${configured()} env=${env().plaidEnv}`);
});
