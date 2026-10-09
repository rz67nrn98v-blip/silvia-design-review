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

    if (method === "OPTIONS" && (PLAID_PATHS.has(pathname) || pathname.startsWith("/item") || pathname.startsWith("/link") || isPlaidHealth)) {
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
