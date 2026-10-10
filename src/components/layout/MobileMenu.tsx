"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks, site } from "@/data/site";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

type Props = { open: boolean; activeId: string | null; onNavigate: () => void };

export function MobileMenu({ open, activeId, onNavigate }: Props) {
  if (!open) return null;

  return (
    <div id="mobile-menu" className="border-b border-brand-gold/25 bg-brand-surface px-5 py-5 md:hidden">
      <nav aria-label="Menú móvil" className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={activeId === link.href.slice(1) ? "location" : undefined}
            className="flex min-h-12 items-center justify-between border-b border-brand-border text-sm font-bold uppercase tracking-[0.18em] text-brand-ivory hover:text-brand-gold aria-[current]:text-brand-gold"
          >
            {link.longLabel}
            <ChevronRight aria-hidden="true" className="size-4 text-brand-gold" />
          </a>
        ))}
        <div className="flex flex-col gap-3 pt-4">
          <ButtonLink href="#contacto-visita" onClick={onNavigate}>
            Agendar visita a terreno
          </ButtonLink>
          <ButtonLink
            variant="outline"
            href={buildWhatsAppUrl(generalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            WhatsApp ({site.phones[0]})
          </ButtonLink>
        </div>
      </nav>
    </div>
  );
}
