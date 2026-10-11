import Image from "next/image";
import { InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";
import { site } from "@/data/site";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

const socialLinks = [
  { label: "Instagram", url: site.instagram.url, icon: InstagramIcon },
  { label: "TikTok", url: site.tiktok.url, icon: TikTokIcon },
];

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
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <ul aria-label="WhatsApp" className="flex flex-wrap justify-center gap-x-4">
            {site.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={buildWhatsAppUrl(generalMessage, phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center hover:text-brand-gold hover:underline"
                >
                  {phone}
                </a>
              </li>
            ))}
          </ul>
          <ul aria-label="Redes sociales" className="flex flex-wrap justify-center gap-x-3">
            {socialLinks.map(({ label, url, icon: Icon }) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} de ${site.name}`}
                  className="flex size-11 items-center justify-center rounded-full border border-brand-gold/30 text-brand-gold transition-colors hover:border-brand-gold hover:bg-brand-gold/10"
                >
                  <Icon aria-hidden="true" className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <p>
            © {currentYear} {site.name} · {site.location}, Chile
          </p>
          <a
            href="https://amalinnovations.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 text-xs"
          >
            <span>
              Creado por{" "}
              <span className="font-semibold text-brand-linen group-hover:text-brand-gold group-hover:underline">
                Amal Innovations
              </span>
            </span>
            <span className="block size-11 shrink-0 overflow-hidden rounded-full border border-brand-gold/30 bg-black transition-colors group-hover:border-brand-gold">
              <Image src="/images/amal-logo.png" alt="" width={44} height={44} className="size-full scale-125 object-cover" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
