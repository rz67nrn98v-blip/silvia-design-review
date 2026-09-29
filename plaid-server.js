/**
 * Silvia Plaid link-token API (sandbox demo).
 * Secrets stay server-side. Never returns access_token to the client.
 */
import http from "node:http";
import { randomUUID } from "node:crypto";

const ANDROID_PACKAGE = "com.silvia.app";
const CLIENT_NAME = "Silvia";
const PORT = Number(process.env.PORT || 3000);

/** @type {Map<string, { access_token: string, item_id: string, accounts: any[], institution: any, updated_at: string }>} */
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

function send(res, status, data) {
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

async function plaidPost(path, body) {
  const { clientId, secret, plaidEnv } = env();
  const res = await fetch(`${plaidHost(plaidEnv)}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: clientId, secret, ...body }),
  });
  const data = await res.json().catch(() => ({ error: "invalid_plaid_response" }));
  return { ok: res.ok, status: res.status, data };
}

function requireConfigured(res) {
  if (!configured()) {
    send(res, 503, {
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

function pathOnly(url) {
  const u = new URL(url, "http://localhost");
  return (u.pathname.replace(/\/+$/, "") || "/");
}

const server = http.createServer(async (req, res) => {
  try {
    const method = req.method || "GET";
    const path = pathOnly(req.url || "/");
    const url = new URL(req.url || "/", "http://localhost");

    if (method === "OPTIONS") {
      send(res, 200, { ok: true });
      return;
    }

    if (method === "GET" && (path === "/health" || path === "/")) {
      send(res, 200, {
        ok: true,
        service: "silvia-plaid",
        plaid_configured: configured(),
        plaid_env: env().plaidEnv,
        android_package_name: ANDROID_PACKAGE,
        items_in_memory: items.size,
      });
      return;
    }

    if (method === "POST" && path === "/link/token/create") {
      if (requireConfigured(res)) return;
      const body = await readJson(req);
      const clientUserId =
        body.client_user_id || `silvia-android-${randomUUID().slice(0, 8)}`;
      const { ok, status, data } = await plaidPost("/link/token/create", {
        user: { client_user_id: clientUserId },
        client_name: CLIENT_NAME,
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
        android_package_name: ANDROID_PACKAGE,
      });
      if (!ok) {
        send(res, status >= 400 ? status : 502, {
          error: "plaid_link_token_failed",
          plaid_error: data?.error_code || data?.error || data,
          message: data?.error_message || "link token create failed",
        });
        return;
      }
      send(res, 200, {
        link_token: data.link_token,
        expiration: data.expiration,
        request_id: data.request_id,
        client_user_id: clientUserId,
      });
      return;
    }

    if (method === "POST" && path === "/item/public_token/exchange") {
      if (requireConfigured(res)) return;
      const body = await readJson(req);
      const publicToken = body.public_token;
      if (!publicToken) {
        send(res, 400, { error: "missing_public_token" });
        return;
      }

      const ex = await plaidPost("/item/public_token/exchange", {
        public_token: publicToken,
      });
      if (!ex.ok) {
        send(res, ex.status >= 400 ? ex.status : 502, {
          error: "plaid_exchange_failed",
          plaid_error: ex.data?.error_code || ex.data,
          message: ex.data?.error_message || "exchange failed",
        });
        return;
      }

      const accessToken = ex.data.access_token;
      const itemId = ex.data.item_id;

      const accts = await plaidPost("/accounts/get", { access_token: accessToken });
      const accounts = accts.ok ? summarizeAccounts(accts.data.accounts || []) : [];

      let transactions = [];
      const tx = await plaidPost("/transactions/get", {
        access_token: accessToken,
        start_date: isoDaysAgo(90),
        end_date: todayIso(),
        options: { count: 100, offset: 0 },
      });
      if (tx.ok) {
        transactions = (tx.data.transactions || []).map((t) => ({
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
      }

      items.set(itemId, {
        access_token: accessToken,
        item_id: itemId,
        accounts,
        institution: body.institution || null,
        updated_at: new Date().toISOString(),
      });

      send(res, 200, {
        item_id: itemId,
        accounts,
        transactions,
        institution: body.institution || null,
        transactions_window_days: 90,
      });
      return;
    }

    if (method === "GET" && path === "/item/accounts") {
      if (requireConfigured(res)) return;
      const itemId = url.searchParams.get("item_id") || "";
      const stored = items.get(itemId);
      if (!stored) {
        send(res, 404, { error: "item_not_found" });
        return;
      }
      const accts = await plaidPost("/accounts/get", {
        access_token: stored.access_token,
      });
      if (!accts.ok) {
        send(res, accts.status >= 400 ? accts.status : 502, {
          error: "plaid_accounts_failed",
          plaid_error: accts.data?.error_code || accts.data,
        });
        return;
      }
      const accounts = summarizeAccounts(accts.data.accounts || []);
      stored.accounts = accounts;
      stored.updated_at = new Date().toISOString();
      send(res, 200, { item_id: itemId, accounts });
      return;
    }

    if (method === "GET" && path === "/item/transactions") {
      if (requireConfigured(res)) return;
      const itemId = url.searchParams.get("item_id") || "";
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") || 90)));
      const stored = items.get(itemId);
      if (!stored) {
        send(res, 404, { error: "item_not_found" });
        return;
      }
      const tx = await plaidPost("/transactions/get", {
        access_token: stored.access_token,
        start_date: isoDaysAgo(days),
        end_date: todayIso(),
        options: { count: 100, offset: 0 },
      });
      if (!tx.ok) {
        send(res, tx.status >= 400 ? tx.status : 502, {
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
      send(res, 200, {
        item_id: itemId,
        days,
        transactions,
        total: tx.data.total_transactions ?? transactions.length,
      });
      return;
    }

    if (method === "POST" && path === "/item/disconnect") {
      const body = await readJson(req);
      const itemId = body.item_id || "";
      if (itemId) items.delete(itemId);
      send(res, 200, { ok: true, disconnected: itemId || null });
      return;
    }

    send(res, 404, { error: "not_found", path });
  } catch (err) {
    console.error("silvia-plaid error", err);
    send(res, 500, { error: "internal_error", message: String(err?.message || err) });
  }
});

server.listen(PORT, () => {
  console.log(
    `silvia-plaid listening on :${PORT} configured=${configured()} env=${env().plaidEnv}`
  );
});
