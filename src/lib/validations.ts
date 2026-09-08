import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const phonePattern = /^0(?:5\d|[2-4789])-?\d{7}$/;

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().email().max(120),
  customerPhone: z.string().trim().regex(phonePattern, "מספר טלפון לא תקין"),
  address: z.string().trim().min(4).max(160),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variant: z.enum(["fabric_large", "fabric_small", "fabric_square", "laminated"]),
        quantity: z.number().int().min(1).max(20),
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
    .max(500)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), {
      message: "יש להזין נתיב מקומי או כתובת https",
    }),
  fabricShape: z.enum(["standard", "square"]),
  priceLargeShekels: z.number().min(0).max(20000),
  priceSmallShekels: z.number().min(0).max(20000),
  priceSquareShekels: z.number().min(0).max(20000),
  laminatedA3Price: z.number().positive().max(20000),
  inStock: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const contentSchema = z.object({
  logo_text: z.string().trim().min(1).max(40),
  hero_title: z.string().trim().min(4).max(120),
  catalog_cta: z.string().trim().min(2).max(80),
  about_title: z.string().trim().min(2).max(80),
  about_body: z.string().trim().min(10).max(2000),
  footer_text: z.string().trim().min(2).max(160),
});

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
