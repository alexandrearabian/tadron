import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Marvel } from "next/font/google";
import "./globals.css";

// Body: Barlow, large x-height, easy to read at length
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600"] });

// Headings: its condensed sibling, the playbill look of Tadrón's flyers
const barlowCondensed = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["500", "600", "700"] });

// Brand accents (wordmark, dates, stamps): Marvel, the font from Tadrón's own design files
const marvel = Marvel({ variable: "--font-marvel", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: { default: "Tadrón Teatro", template: "%s · Tadrón Teatro" },
  description: "Sala de teatro independiente en Palermo, Buenos Aires. Cartelera, cursos y talleres.",
  // Files in /public
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" data-scroll-behavior="smooth" className={`${barlow.variable} ${barlowCondensed.variable} ${marvel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
