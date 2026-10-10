import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { maxTerm, minDownPayment } from "@/data/credit";
import { lots } from "@/data/lots";
import { heroStats } from "@/data/pillars";
import { site } from "@/data/site";
import { formatClp, formatPercent, formatUf } from "@/lib/format";
import { minPriceUf } from "@/lib/lots";
import { buildWhatsAppUrl, visitMessage } from "@/lib/whatsapp";

export function Hero({ ufValue }: { ufValue: number }) {
  const fromPriceUf = minPriceUf(lots);

  return (
    <section id="inicio" className="border-b border-brand-gold/15 pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="flex flex-col items-start">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/35 bg-brand-surface px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-gold motion-safe:animate-pulse" />
            {site.project} · {site.location}
          </p>

          <h1 className="hero-title mb-5 font-serif tracking-tight text-brand-ivory">
            Tu terreno, tu proyecto, <span className="gold-gradient-text italic">tu decisión.</span>
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-brand-linen lg:text-lg">
            Parcelas de 5.000 m² con Rol Propio individual, red de luz 100% subterránea y crédito directo en hasta{" "}
            {maxTerm} cuotas.
          </p>

          <dl className="mb-8 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="reticle-corner rounded-xl border border-brand-gold/25 bg-brand-surface/90 p-3 text-center"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">{stat.label}</dt>
                <dd className="mt-1 font-serif text-lg font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="#catalogo">Ver parcelas disponibles</ButtonLink>
            <ButtonLink variant="outline" href={buildWhatsAppUrl(visitMessage)} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[540px] overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-surface shadow-gold-glow">
          {/* La pieza trae texto propio: se muestra entera, en su proporción original y sin nada encima. */}
          <Image
            src="/images/parcela_post_1.jpg"
            alt="Terravida, Parcelas & Naturaleza. Tu terreno. Tu proyecto. Tu decisión. Espacio, naturaleza y libertad para construir la vida que siempre imaginaste."
            width={640}
            height={639}
            preload
            sizes="(min-width: 1024px) 540px, 100vw"
            className="h-auto w-full"
          />
          <div className="flex items-center justify-between gap-3 border-t border-brand-gold/25 p-4 sm:px-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Preventa Etapa 1</p>
              <p className="font-serif text-2xl font-bold leading-tight text-brand-ivory">Desde {formatUf(fromPriceUf)}</p>
              <p className="text-sm text-brand-linen">~{formatClp(fromPriceUf * ufValue)} CLP</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-brand-gold">Pie desde {formatPercent(minDownPayment)}</p>
              <p className="text-xs text-white/80">Hasta {maxTerm} cuotas en UF</p>
              <a
                href="#simulador"
                className="mt-1 inline-block py-1 text-xs font-bold uppercase tracking-wider text-brand-gold-light underline"
              >
                Simular cuota →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
