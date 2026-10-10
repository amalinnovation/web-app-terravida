import { site } from "@/data/site";
import { formatPercent, formatUf } from "@/lib/format";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const generalMessage = "Hola Terravida, deseo información sobre las parcelas.";
export const visitMessage = "Hola, quiero coordinar una visita a Terravida.";

export function simulationMessage(input: {
  lotName: string;
  priceUf: number;
  downPaymentPct: number;
  downPaymentUf: number;
  months: number;
  installmentUf: number;
}): string {
  return [
    `Hola! Vengo de la web y coticé *${input.lotName}* (${formatUf(input.priceUf)}):`,
    `• Pie: ${formatPercent(input.downPaymentPct)} (${formatUf(input.downPaymentUf)})`,
    `• Plazo: ${input.months} cuotas de ~${formatUf(input.installmentUf, 2)}`,
    "Quiero confirmar disponibilidad y coordinar visita.",
  ].join("\n");
}

export function visitRequestMessage(input: { name: string; phone: string; date?: string }): string {
  const [year, month, day] = (input.date ?? "").split("-");
  const date = year && month && day ? `${day}/${month}/${year}` : "Por coordinar";
  return [
    "*Solicitud de Visita Web*",
    `• Nombre: ${input.name}`,
    `• Tel: ${input.phone}`,
    `• Fecha: ${date}`,
    "Favor coordinar visita a Refugio El Convento.",
  ].join("\n");
}
