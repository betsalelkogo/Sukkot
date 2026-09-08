import { createHash, timingSafeEqual } from "crypto";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionKey } from "./session-key";

const COOKIE_NAME = "admin_session";
const ACCESS_MINUTES = 15;
const BCRYPT_COST = 12;

let cachedPasswordHash: string | null = null;

function sameText(left: string, right: string) {
  const a = createHash("sha256").update(left.toLowerCase()).digest();
  const b = createHash("sha256").update(right.toLowerCase()).digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

async function expectedPasswordHash() {
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (storedHash?.startsWith("$2")) {
    return storedHash;
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    return null;
  }
  if (!cachedPasswordHash) {
    cachedPasswordHash = await hash(password, BCRYPT_COST);
  }
  return cachedPasswordHash;
}

export async function verifyAdminLogin(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  if (!expectedEmail) {
    return false;
  }
  if (!sameText(email.trim(), expectedEmail.trim())) {
    return false;
  }
  const passwordHash = await expectedPasswordHash();
  if (!passwordHash) {
    return false;
  }
  return compare(password, passwordHash);
}

export async function createAdminSession() {
  const secret = await getSessionKey();
  if (!secret) {
    throw new Error("Admin credentials are not configured");
  }
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_MINUTES}m`)
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_MINUTES * 60,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession(token?: string) {
  const value = token ?? (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }
  try {
    const secret = await getSessionKey();
    if (!secret) {
      return null;
    }
    const { payload } = await jwtVerify(value, secret, {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}
