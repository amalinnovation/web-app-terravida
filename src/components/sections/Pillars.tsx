import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pillars } from "@/data/pillars";

export function Pillars() {
  return (
    <section id="pilares" className="border-b border-brand-gold/15 bg-brand-surface/50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Certeza & Entorno" title="Pilares del Proyecto" />
        <Reveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description, tag }) => (
            <Card key={title} className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/15 text-brand-gold">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-brand-ivory">{title}</h3>
                <p className="text-sm leading-relaxed text-brand-linen">{description}</p>
              </div>
              <p className="mt-5 border-t border-brand-gold/15 pt-3 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                {tag}
              </p>
            </Card>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
