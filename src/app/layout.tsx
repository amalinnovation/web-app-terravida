import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { maxTerm } from "@/data/credit";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "TERRAVÍDA — Parcelas & Naturaleza | Refugio El Convento, Santo Domingo";
const description = `Parcelas exclusivas de 5.000 m² en Refugio El Convento, Santo Domingo. Rol propio, luz soterrada y crédito directo en hasta ${maxTerm} cuotas.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "Terravida",
    title,
    description,
    images: [{ url: "/images/parcela_post_1.jpg", width: 640, height: 639, alt: "Parcela Terravida" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/parcela_post_1.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0a0c0a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${garamond.variable} ${cinzel.variable} ${jakarta.variable}`}>
      <body className="bg-grain relative min-h-screen bg-brand-black font-sans text-brand-ivory antialiased">
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
