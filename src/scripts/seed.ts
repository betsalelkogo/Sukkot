import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { DEFAULT_CONTENT, SAMPLE_PRODUCTS } from "../lib/defaults";
import { products, siteContent } from "../lib/schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  const db = drizzle(neon(url));

  for (const [key, value] of Object.entries(DEFAULT_CONTENT)) {
    await db
      .insert(siteContent)
      .values({ key, value })
      .onConflictDoNothing({ target: siteContent.key });
  }

  for (const product of SAMPLE_PRODUCTS) {
    await db
      .insert(products)
      .values({
        ...product,
        inStock: true,
      })
      .onConflictDoNothing({ target: products.slug });
  }

  console.log("Seed completed");
}

seed().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exit(1);
});
