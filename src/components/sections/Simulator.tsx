"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { creditConfig, maxTerm } from "@/data/credit";
import { simulate } from "@/lib/credit";
import { formatClp, formatDate, formatM2, formatPercent, formatUf } from "@/lib/format";
import type { UfQuote } from "@/lib/uf";
import { buildWhatsAppUrl, simulationMessage } from "@/lib/whatsapp";

type Payment = "credito" | "contado";

const paymentOptions: readonly { value: Payment; label: string }[] = [
  { value: "credito", label: `${formatPercent(creditConfig.downPaymentPct)} pie + cuotas` },
  { value: "contado", label: "Contado" },
];

const purchaseTerms = [
  {
    term: "Reserva",
    detail: `${formatClp(creditConfig.reservationClp)}. No forma parte del valor de la parcela: cubre gastos operacionales.`,
  },
  {
    term: "Forma de pago",
    detail: `Contado, o ${formatPercent(creditConfig.downPaymentPct)} de pie y el saldo en hasta ${maxTerm} cuotas.`,
  },
  {
    term: "Descuentos",
    detail: "Al contado se aplican sobre el total; con crédito, sobre el interés.",
  },
  {
    term: "Escritura",
    detail: `En notaría, en un plazo de ${creditConfig.deedDays} días.`,
  },
];

export function Simulator({ uf }: { uf: UfQuote }) {
  const { selectedLot } = useLotSelection();
  const [payment, setPayment] = useState<Payment>("credito");
  const [months, setMonths] = useState(creditConfig.defaultTerm);

  const isCredit = payment === "credito";
  const result = simulate({
    priceUf: selectedLot.priceUf,
    downPaymentPct: isCredit ? creditConfig.downPaymentPct : 1,
    ufValue: uf.value,
  });

  const whatsappUrl = buildWhatsAppUrl(
    simulationMessage(
      isCredit
        ? {
            payment: "credito",
            lotName: selectedLot.name,
            priceUf: selectedLot.priceUf,
            downPaymentPct: creditConfig.downPaymentPct,
            downPaymentUf: result.downPaymentUf,
            balanceUf: result.balanceUf,
            months,
          }
        : { payment: "contado", lotName: selectedLot.name, priceUf: selectedLot.priceUf },
    ),
  );

  const ufNote =
    uf.isFallback || !uf.date
      ? `Pesos calculados con una UF de referencia de ${formatClp(uf.value)}.`
      : `Pesos calculados con la UF del ${formatDate(uf.date)} (${formatClp(uf.value)}).`;

  return (
    <section id="simulador" className="border-b border-brand-gold/15 bg-brand-surface/60 py-16 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Sin bancos" title="Simulador de Compra" />

        <div className="reticle-corner mt-10 rounded-3xl border border-brand-gold/35 bg-brand-card p-5 shadow-gold-glow sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-brand-gold/15 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-muted">Parcela en simulación</p>
              <p className="font-serif text-xl font-bold text-brand-ivory">{selectedLot.name}</p>
              <p className="text-sm text-brand-linen">{formatM2(selectedLot.surfaceM2)}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-bold text-brand-gold">{formatUf(selectedLot.priceUf)}</p>
              <p className="text-sm text-brand-linen">~{formatClp(result.priceClp)} CLP</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">Forma de pago</legend>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((option) => (
                  <Chip
                    key={option.value}
                    selected={payment === option.value}
                    onClick={() => setPayment(option.value)}
                    className="px-2"
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
            {isCredit && (
              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">
                  Plazo del saldo en cuotas
                </legend>
                <div className="grid grid-cols-4 gap-2">
                  {creditConfig.termOptions.map((option) => (
                    <Chip
                      key={option}
                      selected={months === option}
                      onClick={() => setMonths(option)}
                      aria-label={`${option} cuotas`}
                      className="px-2"
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div aria-live="polite" className="mb-4 rounded-2xl border border-brand-gold/20 bg-brand-surface p-5">
            {isCredit ? (
              <dl className="space-y-3 text-sm text-brand-linen">
                <div className="flex items-baseline justify-between gap-4">
                  <dt>Pie inicial ({formatPercent(creditConfig.downPaymentPct)}):</dt>
                  <dd className="text-right">
                    <span className="block font-serif text-xl font-bold text-brand-gold">
                      {formatUf(result.downPaymentUf)}
                    </span>
                    <span className="text-brand-ivory">~{formatClp(result.downPaymentClp)} CLP</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-brand-gold/15 pt-3">
                  <dt>Saldo en {months} cuotas:</dt>
                  <dd className="text-right">
                    <span className="block font-serif text-xl font-bold text-brand-gold">
                      {formatUf(result.balanceUf)}
                    </span>
                    <span className="text-brand-ivory">~{formatClp(result.balanceClp)} CLP + interés</span>
                  </dd>
                </div>
              </dl>
            ) : (
              <dl className="text-sm text-brand-linen">
                <div className="flex items-baseline justify-between gap-4">
                  <dt>Valor al contado, antes de descuento:</dt>
                  <dd className="text-right">
                    <span className="block font-serif text-xl font-bold text-brand-gold">
                      {formatUf(selectedLot.priceUf)}
                    </span>
                    <span className="text-brand-ivory">~{formatClp(result.priceClp)} CLP</span>
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <p className="mb-5 text-xs leading-relaxed text-brand-muted">
            {isCredit
              ? "El crédito directo tiene un interés que depende del plazo. El valor de la cuota y los descuentos vigentes se informan en la cotización."
              : "El descuento por pago contado se aplica sobre el total y se informa en la cotización."}{" "}
            {ufNote} Simulación referencial que no constituye oferta ni aprobación de crédito; las condiciones finales
            se formalizan con la inmobiliaria.
          </p>

          <ButtonLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <MessageCircle aria-hidden="true" className="size-5" />
            Pedir cotización por WhatsApp
          </ButtonLink>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-center font-serif text-2xl text-brand-ivory">Condiciones de compra</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {purchaseTerms.map((item) => (
              <div key={item.term} className="rounded-2xl border border-brand-gold/20 bg-brand-card p-4">
                <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-gold">{item.term}</dt>
                <dd className="text-sm leading-relaxed text-brand-linen">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
