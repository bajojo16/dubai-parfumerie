import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { template: "%s | Dubaï Parfumerie", default: "Dubaï Parfumerie — Parfums Orientaux Authentiques" },
  description: "Spécialiste des parfums orientaux de Dubaï et du Golfe. Oud, musc, ambre, attar — 300+ références authentiques.",
  metadataBase: new URL('https://www.dubaiparfumerie.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${cormorant.variable} ${jost.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-sans)", margin: 0 }}>{children}</body>
    </html>
  );
}
