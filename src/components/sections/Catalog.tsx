"use client";

import Image from "next/image";
import { useState } from "react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredLots, lots, priceTiers, type PriceTier } from "@/data/lots";
import { formatClp, formatM2, formatUf } from "@/lib/format";
import { filterLots, findLot } from "@/lib/lots";

export function Catalog({ ufValue }: { ufValue: number }) {
  const [tier, setTier] = useState<PriceTier>("todas");
  const { selectedLot, selectLot } = useLotSelection();
  const visibleLots = filterLots(lots, tier);

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

        <div className="mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h3 className="font-serif text-2xl text-brand-ivory">Listado completo de precios</h3>
          <div
            role="group"
            aria-label="Filtrar parcelas por precio"
            className="flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-brand-gold/25 bg-brand-surface p-1.5"
          >
            {priceTiers.map((option) => (
              <Chip key={option.value} selected={tier === option.value} onClick={() => setTier(option.value)}>
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        {visibleLots.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-brand-gold/25 bg-brand-card p-8 text-center text-brand-linen">
            No hay parcelas en este tramo de precio por ahora.
          </p>
        ) : (
          <div className="mt-5 max-h-[34rem] overflow-auto rounded-2xl border border-brand-gold/25 bg-brand-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Parcelas de Refugio El Convento con superficie, servidumbre y precio en UF
              </caption>
              <thead className="sticky top-0 bg-brand-surface text-xs uppercase tracking-wider text-brand-gold">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Parcela
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Superficie
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">
                    Servidumbre
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Precio
                  </th>
                  <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">
                    Referencia CLP
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Acción</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleLots.map((lot) => {
                  const isSelected = lot.id === selectedLot.id;
                  return (
                    <tr
                      key={lot.id}
                      className={`border-t border-brand-gold/10 ${isSelected ? "bg-brand-gold/10" : ""}`}
                    >
                      <th scope="row" className="whitespace-nowrap px-4 py-2 font-serif text-base text-brand-ivory">
                        {lot.name}
                      </th>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-brand-linen">
                        {formatM2(lot.surfaceM2)}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-2 text-right text-brand-muted md:table-cell">
                        {formatM2(lot.easementM2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right font-bold text-brand-gold">
                        {formatUf(lot.priceUf)}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-2 text-right text-brand-linen sm:table-cell">
                        ~{formatClp(lot.priceUf * ufValue)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Simular compra de ${lot.name}`}
                          aria-pressed={isSelected}
                          onClick={() => handleSimulate(lot.id)}
                        >
                          Simular
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
