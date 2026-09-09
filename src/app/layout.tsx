import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "תמרפאלי · עיצוב גרפי",
  description: "קישוטים לסוכה מאויירים בעבודת יד ומודפסים על בד מיוחד. עמיד בגשם ומחזיק לשנים.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={`${heebo.className} min-h-screen antialiased`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
