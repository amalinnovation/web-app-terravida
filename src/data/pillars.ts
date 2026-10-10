import { BadgeCheck, Banknote, Trees, Zap, type LucideIcon } from "lucide-react";
import { creditConfig, maxTerm } from "./credit";

export const heroStats: readonly { label: string; value: string }[] = [
  { label: "Superficie", value: "5.000 m²" },
  { label: "Estatus", value: "Rol Propio" },
  { label: "Red", value: "Soterrada" },
  { label: "Crédito", value: `${maxTerm} cuotas` },
];

export const pillars: readonly { icon: LucideIcon; title: string; description: string; tag: string }[] = [
  {
    icon: Zap,
    title: "Luz Soterrada",
    description: "Red 100% subterránea. Vista panorámica limpia, sin postes ni cables aéreos.",
    tag: "Norma SEC",
  },
  {
    icon: BadgeCheck,
    title: "Rol Propio Individual",
    description: `Subdivisión aprobada (SAG / CBR). Escritura en notaría en ${creditConfig.deedDays} días.`,
    tag: "D.L. 3.516",
  },
  {
    icon: Banknote,
    title: "Crédito Directo",
    description: `${Math.round(creditConfig.downPaymentPct * 100)}% de pie y el saldo en hasta ${maxTerm} cuotas directas con la inmobiliaria, sin bancos.`,
    tag: "Trato directo",
  },
  {
    icon: Trees,
    title: "Mar & Naturaleza",
    description: "Entorno protegido, brisa marina y cercanía a la Reserva Nacional El Yali.",
    tag: "Santo Domingo",
  },
];

export const travelTimes: readonly { time: string; label: string }[] = [
  { time: "20 minutos", label: "Santo Domingo & Golf" },
  { time: "15 minutos", label: "Reserva El Yali & Playas" },
  { time: "90 minutos", label: "Santiago (Ruta 78)" },
];
