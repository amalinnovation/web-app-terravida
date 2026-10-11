"use client";

import Image from "next/image";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredLots } from "@/data/lots";
import { formatClp, formatM2, formatUf } from "@/lib/format";
import { findLot } from "@/lib/lots";

export function Catalog({ ufValue }: { ufValue: number }) {
  const { selectLot } = useLotSelection();

  function handleSimulate(id: string) {
    selectLot(id);
    document.getElementById("simulador")?.scrollIntoView();
  }

  return (
    <section id="catalogo" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Disponibilidad" title="Catálogo de Parcelas" align="left" />
        <p className="mt-3 max-w-2xl text-sm text-brand-linen">
          Precios de lanzamiento: algunas parcelas tienen descuento por inicio de proyecto. Consulta la disponibilidad
          de cada una por WhatsApp.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredLots.map((featured) => {
            const lot = findLot(featured.lotId);
            if (!lot) return null;
            return (
              <li key={lot.id} className="flex">
                <Card className="flex w-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={featured.image}
                      alt={featured.imageAlt}
                      fill
                      sizes="(min-width: 768px) 380px, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded bg-brand-black/85 px-2.5 py-1 text-xs font-bold uppercase text-brand-gold">
                      {featured.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-xl font-bold text-brand-ivory">{lot.name}</h3>
                      <p className="whitespace-nowrap font-serif text-lg font-bold text-brand-gold">
                        {formatUf(lot.priceUf)}
                      </p>
                    </div>
                    <p className="mb-4 flex-1 text-sm text-brand-linen">
                      {formatM2(lot.surfaceM2)} con Rol Propio y luz soterrada.
                    </p>
                    <p className="mb-4 flex justify-between border-t border-brand-gold/15 pt-3 text-sm text-brand-muted">
                      Valor referencial:
                      <strong className="text-brand-ivory">~{formatClp(lot.priceUf * ufValue)} CLP</strong>
                    </p>
                    <Button className="w-full" onClick={() => handleSimulate(lot.id)}>
                      Simular compra
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
