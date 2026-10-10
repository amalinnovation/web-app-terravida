import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { AutoPlayVideo } from "@/components/gallery/AutoPlayVideo";
import { CarouselTrack } from "@/components/gallery/CarouselTrack";
import { ButtonRouteLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { carouselItems, gallery, type GalleryItem } from "@/data/gallery";

const cardHeight = "h-[22rem] sm:h-[28rem]";

// Cada tarjeta respeta la proporción real de su foto o video.
function shape(item: GalleryItem) {
  if (item.orientation === "landscape") {
    return { ratio: "aspect-[3/2] max-w-[85vw]", sizes: "(min-width: 640px) 672px, 85vw" };
  }
  if (item.type === "video") return { ratio: "aspect-[9/16]", sizes: "(min-width: 640px) 252px, 198px" };
  return { ratio: "aspect-[3/4]", sizes: "(min-width: 640px) 336px, 264px" };
}

export function GalleryCarousel() {
  const remaining = gallery.length - carouselItems.length;

  return (
    <section id="galeria" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <CarouselTrack
          label="Fotos y videos del terreno"
          heading={<SectionHeading eyebrow="El terreno, tal cual" title="Galería" align="left" />}
        >
          {carouselItems.map((item) => {
            const { ratio, sizes } = shape(item);
            return (
              <li key={item.id} className={`shrink-0 snap-start ${cardHeight} ${ratio}`}>
                <Link
                  href="/galeria"
                  aria-label={`${item.alt}. Ver galería completa`}
                  className="group relative block size-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-card shadow-dark-card transition-colors hover:border-brand-gold/60"
                >
                  {item.type === "video" ? (
                    <>
                      <AutoPlayVideo src={item.src} poster={item.poster} className="size-full object-cover" />
                      <span className="glass-card absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                        <Play aria-hidden="true" className="size-3 fill-current" />
                        Video
                      </span>
                    </>
                  ) : (
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes={sizes}
                      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                    />
                  )}
                </Link>
              </li>
            );
          })}

          <li className={`shrink-0 snap-start ${cardHeight} aspect-[3/4]`}>
            <Link
              href="/galeria"
              className="reticle-corner group flex size-full flex-col items-center justify-center gap-3 rounded-2xl border border-brand-gold/40 bg-brand-surface p-6 text-center transition-colors hover:border-brand-gold hover:bg-brand-gold/10"
            >
              <span className="font-serif text-5xl font-bold text-brand-ivory">+{remaining}</span>
              <span className="text-sm leading-relaxed text-brand-linen">fotos y videos más del terreno</span>
              <span className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                Ver galería
                <ArrowRight aria-hidden="true" className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        </CarouselTrack>

        <div className="mt-8 flex justify-center sm:hidden">
          <ButtonRouteLink variant="outline" href="/galeria" className="w-full">
            Ver galería completa
          </ButtonRouteLink>
        </div>
      </div>
    </section>
  );
}
