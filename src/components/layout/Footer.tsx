import Image from "next/image";
import { site } from "@/data/site";

// Se evalúa al cargar el módulo: leer la hora durante el render bloquearía el prerender.
const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-brand-gold/15 bg-brand-black py-10 text-sm text-brand-muted">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="" width={32} height={32} />
          <span className="font-display font-bold tracking-[0.2em] text-white">{site.name}</span>
        </div>
        <p>
          {site.phones.join(" · ")}
          <span aria-hidden="true" className="mx-2">
            |
          </span>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
            {site.instagram.handle}
          </a>
        </p>
        <p>
          © {currentYear} {site.name} · {site.location}, Chile
        </p>
      </div>
    </footer>
  );
}
