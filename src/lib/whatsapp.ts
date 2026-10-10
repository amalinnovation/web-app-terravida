import { site } from "@/data/site";
import { formatPercent, formatUf } from "@/lib/format";

export function buildWhatsAppUrl(message: string, phone: string = site.whatsappNumber): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export const generalMessage = "Hola Terravida, deseo información sobre las parcelas.";
export const visitMessage = "Hola, quiero coordinar una visita a Terravida.";

type SimulationMessageInput =
  | { payment: "contado"; lotName: string; priceUf: number }
  | {
      payment: "credito";
      lotName: string;
      priceUf: number;
      downPaymentPct: number;
      downPaymentUf: number;
      balanceUf: number;
      months: number;
    };

export function simulationMessage(input: SimulationMessageInput): string {
  const lot = `*${input.lotName}* (${formatUf(input.priceUf)})`;
  if (input.payment === "contado") {
    return [
      `Hola! Vengo de la web y me interesa ${lot} con pago contado.`,
      "Quiero conocer el descuento vigente y coordinar visita.",
    ].join("\n");
  }
  return [
    `Hola! Vengo de la web y coticé ${lot}:`,
    `• Pie: ${formatPercent(input.downPaymentPct)} (${formatUf(input.downPaymentUf)})`,
    `• Saldo: ${formatUf(input.balanceUf)} en ${input.months} cuotas`,
    "Quiero conocer el valor de la cuota, los descuentos vigentes y coordinar visita.",
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
