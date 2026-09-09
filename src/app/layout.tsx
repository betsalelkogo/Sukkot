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

const SITE_NAME = "תמרפאלי · עיצוב גרפי";
const SITE_DESCRIPTION =
  "קישוטים לסוכה מאויירים בעבודת יד ומודפסים על בד מיוחד. עמיד בגשם ומחזיק לשנים.";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: "/images/logo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/images/logo.jpg", type: "image/jpeg" }],
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1024,
        height: 682,
        alt: SITE_NAME,
      },
    ],
  },
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
