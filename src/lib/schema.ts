import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  galleryUrls: text("gallery_urls").notNull().default("[]"),
  fabricShape: text("fabric_shape").notNull().default("standard"),
  priceLargeAgorot: integer("price_large_agorot"),
  priceSmallAgorot: integer("price_small_agorot"),
  priceSquareAgorot: integer("price_square_agorot"),
  priceLaminatedAgorot: integer("price_laminated_agorot").notNull(),
  stockLarge: integer("stock_large").notNull().default(0),
  stockSmall: integer("stock_small").notNull().default(0),
  stockSquare: integer("stock_square").notNull().default(0),
  stockLaminated: integer("stock_laminated").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  totalAgorot: integer("total_agorot").notNull(),
  morningDocumentId: text("morning_document_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id"),
  productName: text("product_name").notNull(),
  variant: text("variant").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceAgorot: integer("unit_price_agorot").notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
