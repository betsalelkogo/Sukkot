const SALT = "sukkot-admin-session-v1";
const ITERATIONS = 210_000;

let cached: Uint8Array | null = null;

export async function getSessionKey() {
  if (cached) {
    return cached;
  }
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const material = process.env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!email || !material) {
    return null;
  }

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${email.toLowerCase()}:${material}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: enc.encode(SALT),
      iterations: ITERATIONS,
    },
    keyMaterial,
    256,
  );
  cached = new Uint8Array(bits);
  return cached;
}
