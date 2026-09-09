import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const phonePattern = /^(0?5\d-?\d{7}|0?[2-4789]-?\d{7})$/;

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(2).max(40),
  lastName: z.string().trim().min(2).max(40),
  customerEmail: z.string().trim().email().max(120),
  customerPhone: z.string().trim().regex(phonePattern, "מספר טלפון לא תקין"),
  country: z.string().trim().min(2).max(60),
  pickupPointId: z.string().uuid(),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
  acceptedTerms: z.literal(true),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variant: z.enum(["fabric_large", "fabric_small", "fabric_square", "laminated"]),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(30),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().toLowerCase().regex(slugPattern).max(80),
  description: z.string().trim().min(4).max(600),
  imageUrl: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (value) =>
        value.startsWith("/") || value.startsWith("https://"),
      { message: "יש להעלות תמונה או להזין כתובת https" },
    ),
  galleryUrls: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(500)
        .refine((value) => value.startsWith("/") || value.startsWith("https://")),
    )
    .max(8)
    .default([]),
  fabricShape: z.enum(["standard", "square", "custom"]),
  customFabricSize: z.string().trim().max(40).optional().or(z.literal("")),
  customLaminatedSize: z.string().trim().max(40).optional().or(z.literal("")),
  priceLargeShekels: z.number().min(0).max(20000),
  priceSmallShekels: z.number().min(0).max(20000),
  priceSquareShekels: z.number().min(0).max(20000),
  laminatedA3Price: z.number().min(0).max(20000),
  stockLarge: z.number().int().min(0).max(9999),
  stockSmall: z.number().int().min(0).max(9999),
  stockSquare: z.number().int().min(0).max(9999),
  stockLaminated: z.number().int().min(0).max(9999),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
}).superRefine((data, ctx) => {
  const hasLarge = data.priceLargeShekels > 0;
  const hasSmall = data.priceSmallShekels > 0;
  const hasSquare = data.priceSquareShekels > 0;
  const hasLaminated = data.laminatedA3Price > 0;
  if (!hasLarge && !hasSmall && !hasSquare && !hasLaminated) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "יש להזין לפחות גודל אחד עם מחיר",
      path: ["priceLargeShekels"],
    });
  }
  if (data.fabricShape === "custom" && hasLarge && !data.customFabricSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "יש להזין את גודל הבד",
      path: ["customFabricSize"],
    });
  }
  if (data.fabricShape === "custom" && hasLaminated && !data.customLaminatedSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "יש להזין את גודל המנויילן",
      path: ["customLaminatedSize"],
    });
  }
});

export const contentSchema = z
  .object({
    logo_text: z.string().trim().min(1).max(40),
    hero_title: z.string().trim().min(4).max(120),
    catalog_cta: z.string().trim().min(2).max(80),
    about_title: z.string().trim().min(2).max(80),
    about_body: z.string().trim().min(10).max(2000),
    footer_text: z.string().trim().min(2).max(160),
    thankyou_title: z.string().trim().min(2).max(80),
    thankyou_body: z.string().trim().min(10).max(2000),
    terms_title: z.string().trim().min(2).max(80),
    terms_body: z.string().trim().min(20).max(40000),
    terms_updated: z.string().trim().min(6).max(20),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "Empty" });

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(200),
});

export const pickupPointSchema = z.object({
  name: z.string().trim().min(2).max(80),
  details: z.string().trim().max(240).optional().or(z.literal("")),
  hours: z.string().trim().max(120).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(9999),
  active: z.boolean(),
});

export function normalizeLocalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? digits : `0${digits}`;
}

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type PickupPointInput = z.infer<typeof pickupPointSchema>;
