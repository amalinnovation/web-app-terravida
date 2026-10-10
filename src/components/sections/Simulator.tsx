"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { creditConfig } from "@/data/credit";
import { simulate } from "@/lib/credit";
import { formatClp, formatDate, formatPercent, formatUf } from "@/lib/format";
import type { UfQuote } from "@/lib/uf";
import { buildWhatsAppUrl, simulationMessage } from "@/lib/whatsapp";

export function Simulator({ uf }: { uf: UfQuote }) {
  const { selectedLot } = useLotSelection();
  const [downPaymentPct, setDownPaymentPct] = useState(creditConfig.defaultDownPayment);
  const [months, setMonths] = useState(creditConfig.defaultTerm);

  const result = simulate({
    priceUf: selectedLot.priceUf,
    downPaymentPct,
    months,
    monthlyRate: creditConfig.monthlyRate,
    ufValue: uf.value,
  });

  const whatsappUrl = buildWhatsAppUrl(
    simulationMessage({
      lotName: selectedLot.name,
      priceUf: selectedLot.priceUf,
      downPaymentPct,
      downPaymentUf: result.downPaymentUf,
      months,
      installmentUf: result.installmentUf,
    }),
  );

  const ufNote =
    uf.isFallback || !uf.date
      ? `UF a valor de referencia (${formatClp(uf.value)}).`
      : `UF del ${formatDate(uf.date)}: ${formatClp(uf.value)}.`;
  const rateNote =
    creditConfig.monthlyRate === 0
      ? "Sin interés"
      : `Tasa ${(creditConfig.monthlyRate * 100).toLocaleString("es-CL")}% mensual`;

  return (
    <section id="simulador" className="border-b border-brand-gold/15 bg-brand-surface/60 py-16 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Sin bancos" title="Simulador de Crédito Directo" />

        <div className="reticle-corner mt-10 rounded-3xl border border-brand-gold/35 bg-brand-card p-5 shadow-gold-glow sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-brand-gold/15 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-muted">Lote en simulación</p>
              <p className="font-serif text-xl font-bold text-brand-ivory">{selectedLot.name}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-bold text-brand-gold">{formatUf(selectedLot.priceUf)}</p>
              <p className="text-sm text-brand-linen">~{formatClp(selectedLot.priceUf * uf.value)} CLP</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">Pie inicial</legend>
              <div className="grid grid-cols-2 gap-2">
                {creditConfig.downPaymentOptions.map((option) => (
                  <Chip key={option} selected={downPaymentPct === option} onClick={() => setDownPaymentPct(option)}>
                    {formatPercent(option)} pie
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">
                Plazo en cuotas
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {creditConfig.termOptions.map((option) => (
                  <Chip
                    key={option}
                    selected={months === option}
                    onClick={() => setMonths(option)}
                    aria-label={`${option} cuotas`}
                    className="px-0"
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <div aria-live="polite" className="mb-4 rounded-2xl border border-brand-gold/20 bg-brand-surface p-5">
            <dl className="space-y-2 text-sm text-brand-linen">
              <div className="flex items-center justify-between gap-4">
                <dt>Pie inicial a pagar:</dt>
                <dd className="font-serif text-base font-bold text-brand-gold">
                  {formatUf(result.downPaymentUf)} (~{formatClp(result.downPaymentClp)})
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Saldo en cuotas directas:</dt>
                <dd className="font-bold text-white">{formatUf(result.balanceUf)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-brand-gold/15 pt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Cuota mensual fija en UF</p>
                <p className="text-xs text-brand-muted">
                  {rateNote} · {months} cuotas
                </p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl font-bold text-brand-gold sm:text-3xl">
                  {formatUf(result.installmentUf, 2)} / mes
                </p>
                <p className="text-sm font-medium text-brand-ivory">~{formatClp(result.installmentClp)} CLP</p>
              </div>
            </div>
          </div>

          <p className="mb-5 text-xs leading-relaxed text-brand-muted">
            {ufNote} Los montos en pesos son una referencia a esa fecha: la cuota es fija en UF y su valor en pesos
            varía con la UF. Simulación referencial que no constituye oferta ni aprobación de crédito; las condiciones
            finales se formalizan con la inmobiliaria.
          </p>

          <ButtonLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <MessageCircle aria-hidden="true" className="size-5" />
            Solicitar esta simulación por WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
