const TOKEN_CACHE_MS = 45 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

type TokenCache = { token: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function morningEnv() {
  return process.env.MORNING_ENV === "production" ? "production" : "sandbox";
}

function apiBase() {
  return morningEnv() === "production"
    ? "https://api.greeninvoice.co.il/api/v1"
    : "https://sandbox.d.greeninvoice.co.il/api/v1";
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

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const clientId = process.env.MORNING_CLIENT_ID;
  const clientSecret = process.env.MORNING_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Morning credentials are missing");
  }

  const oauthUrl =
    morningEnv() === "production"
      ? "https://api.morning.co/idp/v1/oauth/token"
      : "https://api.sandbox.morning.dev/idp/v1/oauth/token";

  const oauthBody = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const oauthRes = await fetchWithTimeout(oauthUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: oauthBody.toString(),
  });

  if (oauthRes.ok) {
    const data = (await oauthRes.json()) as { accessToken?: string; access_token?: string };
    const token = data.accessToken ?? data.access_token;
    if (token) {
      tokenCache = { token, expiresAt: Date.now() + TOKEN_CACHE_MS };
      return token;
    }
  }

  const legacyRes = await fetchWithTimeout(`${apiBase()}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: clientId,
      secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!legacyRes.ok) {
    throw new Error("Morning authentication failed");
  }

  const legacy = (await legacyRes.json()) as { token?: string; accessToken?: string };
  const token = legacy.token ?? legacy.accessToken;
  if (!token) {
    throw new Error("Morning authentication failed");
  }
  tokenCache = { token, expiresAt: Date.now() + TOKEN_CACHE_MS };
  return token;
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

export type PaymentLine = {
  description: string;
  quantity: number;
  price: number;
  currency: "ILS";
  vatType: 1;
};

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

  const body = {
    type: 320,
    description: input.description,
    amount: input.amount,
    currency: "ILS",
    lang: "he",
    vatType: 1,
    pluginId: process.env.MORNING_PLUGIN_ID,
    group: 100,
    maxPayments: 1,
    client: {
      name: input.clientName,
      emails: [input.clientEmail],
      phone: input.clientPhone,
      add: true,
    },
    income: input.income,
    successUrl: `${siteUrl}/order/success?order=${encodeURIComponent(input.orderId)}`,
    failureUrl: `${siteUrl}/order/failed?order=${encodeURIComponent(input.orderId)}`,
    notifyUrl: `${siteUrl}/api/webhooks/morning?token=${encodeURIComponent(webhookToken)}`,
    custom: input.orderId,
  };

  const res = await morningFetch("/payments/form", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to create payment form");
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url || !data.url.startsWith("https://")) {
    throw new Error("Invalid payment form response");
  }
  return data.url;
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
