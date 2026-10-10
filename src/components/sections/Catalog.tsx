"use client";

import Image from "next/image";
import { useState } from "react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { lotFilters, lots, type Lot, type LotFilter } from "@/data/lots";
import { formatClp, formatUf } from "@/lib/format";
import { filterLots } from "@/lib/lots";

const badgeTones: Record<Lot["badge"]["tone"], string> = {
  available: "bg-emerald-700",
  last: "bg-amber-700",
};

export function Catalog({ ufValue }: { ufValue: number }) {
  const [filter, setFilter] = useState<LotFilter>("todas");
  const { selectLot } = useLotSelection();
  const visibleLots = filterLots(lots, filter);

  function handleSimulate(id: string) {
    selectLot(id);
    document.getElementById("simulador")?.scrollIntoView();
  }

  return (
    <section id="catalogo" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Disponibilidad" title="Catálogo de Parcelas" align="left" />
          <div
            role="group"
            aria-label="Filtrar parcelas"
            className="flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-brand-gold/25 bg-brand-surface p-1.5"
          >
            {lotFilters.map((option) => (
              <Chip key={option.value} selected={filter === option.value} onClick={() => setFilter(option.value)}>
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        {visibleLots.length === 0 ? (
          <p className="rounded-2xl border border-brand-gold/25 bg-brand-card p-8 text-center text-brand-linen">
            No hay parcelas disponibles en esta categoría por ahora.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleLots.map((lot) => (
              <li key={lot.id} className="flex">
                <Card className="flex w-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={lot.image}
                      alt={`Vista del ${lot.name}`}
                      fill
                      sizes="(min-width: 768px) 380px, 100vw"
                      className="object-cover"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-bold uppercase text-white ${badgeTones[lot.badge.tone]}`}
                    >
                      {lot.badge.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-xl font-bold text-brand-ivory">{lot.name}</h3>
                      <p className="whitespace-nowrap font-serif text-lg font-bold text-brand-gold">
                        {formatUf(lot.priceUf)}
                      </p>
                    </div>
                    <p className="mb-4 flex-1 text-sm text-brand-linen">{lot.description}</p>
                    <p className="mb-4 flex justify-between border-t border-brand-gold/15 pt-3 text-sm text-brand-muted">
                      Valor referencial:
                      <strong className="text-brand-ivory">~{formatClp(lot.priceUf * ufValue)} CLP</strong>
                    </p>
                    <Button className="w-full" onClick={() => handleSimulate(lot.id)}>
                      Simular cuotas
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
