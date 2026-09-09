const TOKEN_CACHE_MS = 45 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;
const PLUGIN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type EnvName = "sandbox" | "production";
type TokenCache = { token: string; expiresAt: number; env: EnvName };

let tokenCache: TokenCache | null = null;

function preferredEnv(): EnvName {
  return process.env.MORNING_ENV === "production" ? "production" : "sandbox";
}

function hosts(env: EnvName) {
  return env === "production"
    ? {
        tokenUrl: "https://api.morning.co/idp/v1/oauth/token",
        apiBase: "https://api.greeninvoice.co.il/api/v1",
      }
    : {
        tokenUrl: "https://api.sandbox.morning.dev/idp/v1/oauth/token",
        apiBase: "https://sandbox.d.greeninvoice.co.il/api/v1",
      };
}

function apiBase() {
  return hosts(tokenCache?.env ?? preferredEnv()).apiBase;
}

function isConfigured() {
  return Boolean(
    process.env.MORNING_CLIENT_ID &&
      process.env.MORNING_CLIENT_SECRET &&
      process.env.MORNING_PLUGIN_ID,
  );
}

export function isMorningConfigured() {
  return isConfigured();
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function login(env: EnvName, clientId: string, clientSecret: string) {
  try {
    const { tokenUrl, apiBase: base } = hosts(env);
    const oauthRes = await fetchWithTimeout(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });
    if (oauthRes.ok) {
      const data = (await oauthRes.json()) as { accessToken?: string; access_token?: string };
      const token = data.accessToken ?? data.access_token;
      if (token) {
        return token;
      }
    }

    const legacyRes = await fetchWithTimeout(`${base}/account/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: clientId,
        secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    if (!legacyRes.ok) {
      return null;
    }
    const legacy = (await legacyRes.json()) as { token?: string; accessToken?: string };
    return legacy.token ?? legacy.accessToken ?? null;
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const clientId = process.env.MORNING_CLIENT_ID;
  const clientSecret = process.env.MORNING_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Morning credentials are missing");
  }

  const env = preferredEnv();
  const token = await login(env, clientId, clientSecret);
  if (token) {
    tokenCache = { token, expiresAt: Date.now() + TOKEN_CACHE_MS, env };
    return token;
  }
  throw new Error("Morning authentication failed");
}

async function morningFetch(path: string, init: RequestInit) {
  const token = await getAccessToken();
  const res = await fetchWithTimeout(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  return res;
}

function addPluginId(value: unknown, found: string[]) {
  if (Array.isArray(value)) {
    for (const item of value) {
      addPluginId(item, found);
    }
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id === "string" && PLUGIN_ID.test(record.id) && !found.includes(record.id)) {
    if ("paymentPlugins" in record || "pluginId" in record || "type" in record || "name" in record) {
      found.push(record.id);
    }
  }
  if (typeof record.pluginId === "string" && PLUGIN_ID.test(record.pluginId) && !found.includes(record.pluginId)) {
    found.push(record.pluginId);
  }
  if (Array.isArray(record.paymentPlugins)) {
    for (const plugin of record.paymentPlugins) {
      const id = plugin && typeof plugin === "object" ? (plugin as { id?: unknown }).id : null;
      if (typeof id === "string" && PLUGIN_ID.test(id) && !found.includes(id)) {
        found.push(id);
      }
    }
  }
  for (const child of Object.values(record)) {
    addPluginId(child, found);
  }
}

async function listPaymentPluginIds() {
  const found: string[] = [];
  for (const path of ["/documents/info?type=320", "/documents/info?type=400"]) {
    const res = await morningFetch(path, { method: "GET" });
    if (!res.ok) {
      continue;
    }
    addPluginId(await res.json(), found);
  }
  const configured = process.env.MORNING_PLUGIN_ID?.trim();
  if (configured && PLUGIN_ID.test(configured) && !found.includes(configured)) {
    found.push(configured);
  }
  return found;
}

export type PaymentLine = {
  description: string;
  quantity: number;
  price: number;
  currency: "ILS";
  vatType: 1 | 2;
};

function applyDealToIncome(lines: PaymentLine[], amount: number) {
  const income = lines.map((line) => ({ ...line }));
  let gap = Math.round(
    (income.reduce((sum, line) => sum + line.price * line.quantity, 0) - amount) * 100,
  ) / 100;
  for (let i = income.length - 1; i >= 0 && gap > 0; i -= 1) {
    const line = income[i];
    const lineTotal = line.price * line.quantity;
    const minTotal = 0.01 * line.quantity;
    const cut = Math.min(gap, Math.max(0, lineTotal - minTotal));
    if (cut <= 0) {
      continue;
    }
    line.price = Math.round(((lineTotal - cut) / line.quantity) * 100) / 100;
    gap = Math.round((gap - cut) * 100) / 100;
  }
  return income;
}

export async function createPaymentForm(input: {
  orderId: string;
  description: string;
  amount: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  income: PaymentLine[];
}) {
  if (!isConfigured()) {
    throw new Error("Morning is not configured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const webhookToken = process.env.MORNING_WEBHOOK_TOKEN;
  if (!siteUrl || !webhookToken) {
    throw new Error("Payment return URLs are not configured");
  }

  const income = applyDealToIncome(
    input.income.filter((line) => line.price > 0),
    input.amount,
  );
  const phone = input.clientPhone.replace(/\D/g, "");
  const normalizedPhone = phone.startsWith("0") ? phone : `0${phone}`;
  const origin = siteUrl.replace(/\/$/, "");
  const pluginIds = await listPaymentPluginIds();
  const attempts = [
    { type: 400, vatType: 2 },
    { type: 400, vatType: 1 },
    { type: 320, vatType: 1 },
  ] as const;
  let lastCode = "no_plugin";

  for (const attempt of attempts) {
    const lines = income.map((line) => ({ ...line, vatType: attempt.vatType }));
    for (const pluginId of pluginIds) {
      const res = await morningFetch("/payments/form", {
        method: "POST",
        body: JSON.stringify({
          type: attempt.type,
          description: input.description,
          amount: input.amount,
          currency: "ILS",
          lang: "he",
          vatType: attempt.vatType,
          pluginId,
          group: 100,
          maxPayments: 1,
          client: {
            name: input.clientName,
            emails: [input.clientEmail],
            phone: normalizedPhone,
            add: true,
          },
          income: lines,
          successUrl: `${origin}/order/success?order=${encodeURIComponent(input.orderId)}`,
          failureUrl: `${origin}/order/failed?order=${encodeURIComponent(input.orderId)}`,
          notifyUrl: `${origin}/api/webhooks/morning?token=${encodeURIComponent(webhookToken)}`,
          custom: input.orderId,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url && data.url.startsWith("https://")) {
          return data.url;
        }
        lastCode = "invalid_url";
        continue;
      }

      lastCode = String(res.status);
      try {
        const err = (await res.json()) as { errorCode?: unknown; errorMessage?: unknown; error?: unknown };
        const parts = [err.errorCode, err.errorMessage, err.error].filter((value) => typeof value === "string");
        if (parts.length) {
          lastCode = parts.join(" ");
        }
      } catch {
        // keep status only
      }
      console.error("morning_payment_form_failed", {
        status: res.status,
        code: lastCode,
        type: attempt.type,
        vatType: attempt.vatType,
      });
    }
  }

  throw new Error(`Failed to create payment form: ${lastCode}`);
}

export async function getMorningDocument(documentId: string) {
  if (!/^[0-9a-f-]{16,}$/i.test(documentId)) {
    return null;
  }
  const res = await morningFetch(`/documents/${documentId}`, { method: "GET" });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as {
    id?: string;
    type?: number;
    status?: number;
    total?: number;
  };
}
