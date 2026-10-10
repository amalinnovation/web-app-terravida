import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={buildWhatsAppUrl(generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="gold-btn fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full shadow-gold-glow sm:bottom-6 sm:right-6"
    >
      <MessageCircle aria-hidden="true" className="size-6" />
    </a>
  );
}
