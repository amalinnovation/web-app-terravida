"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";
import { buildWhatsAppUrl, visitRequestMessage } from "@/lib/whatsapp";

const inputClasses =
  "min-h-12 w-full rounded-xl border border-brand-gold/25 bg-brand-surface px-4 text-base text-brand-ivory placeholder:text-brand-muted focus:border-brand-gold focus:outline-none";
const labelClasses = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-brand-linen";

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function VisitForm() {
  const [sent, setSent] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  // La fecha mínima depende del reloj del visitante, así que se fija en el cliente.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIso();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lead = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      date: String(form.get("date") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    window.open(buildWhatsAppUrl(visitRequestMessage(lead)), "_blank", "noopener,noreferrer");

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      keepalive: true,
    }).catch((error) => console.error("No se pudo registrar el lead por correo.", error));

    setSent(true);
  }

  return (
    <section id="contacto-visita" className="bg-brand-surface/50 py-16 lg:py-24">
      <div className="mx-auto max-w-[580px] px-4 sm:px-6">
        <SectionHeading eyebrow="Terreno" title="Agenda tu Visita Guiada" />
        <p className="mt-3 text-center text-sm text-brand-linen">{site.visitSchedule}</p>

        <form
          onSubmit={handleSubmit}
          className="reticle-corner mt-8 space-y-5 rounded-3xl border border-brand-gold/30 bg-brand-card p-6 shadow-dark-card sm:p-8"
        >
          <div>
            <label htmlFor="visit-name" className={labelClasses}>
              Nombre completo
            </label>
            <input
              id="visit-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder="Tu nombre"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="visit-phone" className={labelClasses}>
              Teléfono / WhatsApp
            </label>
            <input
              id="visit-phone"
              name="phone"
              type="tel"
              required
              pattern="\+?[\d\s\(\)\-]{8,20}"
              title="Ingresa un teléfono válido, por ejemplo +56 9 1234 5678"
              autoComplete="tel"
              placeholder="+56 9 ..."
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="visit-date" className={labelClasses}>
              Fecha estimada de visita <span className="normal-case text-brand-muted">(opcional)</span>
            </label>
            <input ref={dateRef} id="visit-date" name="date" type="date" className={inputClasses} />
          </div>

          <div aria-hidden="true" className="hidden">
            <label htmlFor="visit-website">No completar este campo</label>
            <input id="visit-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <Button type="submit" className="w-full">
            Confirmar visita vía WhatsApp →
          </Button>

          <p role="status" className="text-center text-sm text-brand-gold-light">
            {sent ? `Abrimos WhatsApp con tu solicitud. Si no se abrió, escríbenos al ${site.phones[0]}.` : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
