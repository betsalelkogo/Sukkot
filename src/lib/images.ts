import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireDb } from "./db";
import { productImages } from "./schema";

const MAX_BYTES = 4 * 1024 * 1024;

type ImageKind = {
  mime: string;
  ext: string;
  match: (bytes: Uint8Array) => boolean;
};

const KINDS: ImageKind[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    match: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    match: (bytes) =>
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  },
  {
    mime: "image/gif",
    ext: "gif",
    match: (bytes) =>
      bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38,
  },
  {
    mime: "image/webp",
    ext: "webp",
    match: (bytes) =>
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
];

export function parseGallery(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [];
  } catch {
    return [];
  }
}

export function detectImage(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
    return null;
  }
  return KINDS.find((kind) => kind.match(bytes)) ?? null;
}

export async function persistProductImage(bytes: Uint8Array) {
  const kind = detectImage(bytes);
  if (!kind) {
    return null;
  }

  const id = crypto.randomUUID();
  if (!process.env.VERCEL) {
    try {
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, `${id}.${kind.ext}`), bytes);
      return `/uploads/${id}.${kind.ext}`;
    } catch {
      // Fall through to database storage.
    }
  }

  const db = requireDb();
  await db.insert(productImages).values({
    id,
    mimeType: kind.mime,
    data: Buffer.from(bytes).toString("base64"),
  });
  return `/api/images/${id}`;
}
