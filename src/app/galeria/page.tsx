import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { BackgroundDecor } from "@/components/layout/BackgroundDecor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { ButtonRouteLink } from "@/components/ui/Button";
import { gallery } from "@/data/gallery";
import { site } from "@/data/site";

const title = `Galería — ${site.name} | ${site.project}, ${site.location}`;
const description = `Fotos y videos del terreno de ${site.project}, ${site.location}: accesos, caminos interiores, deslindes y atardeceres con vista al mar.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/galeria" },
  openGraph: { title, description, url: "/galeria" },
};

export default function GalleryPage() {
  return (
    <>
      <BackgroundDecor />
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-24">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver al inicio
        </Link>

        <div className="mx-auto mb-10 mt-6 max-w-xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
            {site.project} · {site.location}
          </p>
          <h1 className="font-serif text-4xl text-brand-ivory sm:text-5xl">Galería</h1>
          <p className="mt-4 text-base leading-relaxed text-brand-linen">
            Fotos y videos tomados en el terreno. Toca cualquiera para verlo en grande.
          </p>
        </div>

        <GalleryGrid items={gallery} />

        <div className="mt-12 flex justify-center">
          <ButtonRouteLink href="/#contacto-visita">Agendar visita a terreno</ButtonRouteLink>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
