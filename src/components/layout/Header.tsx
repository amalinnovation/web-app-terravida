"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks, site } from "@/data/site";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

const sectionIds = navLinks.map((link) => link.href.slice(1));

function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useActiveSection(sectionIds);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gold/15 bg-brand-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <a href="#inicio" className="group flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-gold/40 bg-black p-0.5 sm:size-11">
            <Image src="/images/logo.png" alt="" width={44} height={44} />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base font-bold tracking-[0.18em] text-brand-ivory transition-colors group-hover:text-brand-gold sm:text-lg lg:text-xl">
              {site.name}
            </span>
            <span className="text-[9px] uppercase leading-none tracking-[0.25em] text-brand-gold">{site.tagline}</span>
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeId === link.href.slice(1) ? "location" : undefined}
              className="border-b border-transparent py-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-linen transition-colors hover:text-brand-gold aria-[current]:border-brand-gold aria-[current]:text-brand-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <ButtonLink
            variant="outline"
            size="sm"
            href={buildWhatsAppUrl(generalMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            WhatsApp
          </ButtonLink>
          <ButtonLink size="sm" href="#contacto-visita">
            Agendar visita
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-lg text-brand-gold hover:text-white md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>

      <MobileMenu open={menuOpen} activeId={activeId} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}
