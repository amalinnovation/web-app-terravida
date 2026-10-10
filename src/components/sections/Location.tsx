import { Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { travelTimes } from "@/data/pillars";
import { site } from "@/data/site";

export function Location() {
  return (
    <section id="ubicacion" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 text-center sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Ubicación" title={`${site.project} · ${site.location}`} />
        <Reveal className="mb-8 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {travelTimes.map((item) => (
            <Card key={item.label} className="p-5">
              <p className="mb-1 font-serif text-2xl font-bold text-brand-gold">{item.time}</p>
              <p className="text-sm uppercase tracking-wider text-brand-linen">{item.label}</p>
            </Card>
          ))}
        </Reveal>
        <a
          href={site.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold hover:underline"
        >
          <Navigation aria-hidden="true" className="size-4" />
          Abrir ubicación en Google Maps →
        </a>
      </div>
    </section>
  );
}
