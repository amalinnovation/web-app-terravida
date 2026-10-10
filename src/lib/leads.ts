import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{8,20}$/),
  date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional(),
  /** Campo trampa: los humanos no lo ven, los bots lo rellenan. */
  website: z.string().max(200).optional(),
});

export type Lead = z.infer<typeof leadSchema>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildLeadEmail(lead: Lead): { subject: string; html: string; text: string } {
  const [year, month, day] = (lead.date ?? "").split("-");
  const date = year && month && day ? `${day}/${month}/${year}` : "Por coordinar";
  const rows: [string, string][] = [
    ["Nombre", lead.name],
    ["Teléfono", lead.phone],
    ["Fecha estimada", date],
  ];

  return {
    subject: `Nueva solicitud de visita — ${lead.name}`,
    text: [
      "Solicitud de visita desde la web de Terravida",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n"),
    html: [
      "<h2>Solicitud de visita desde la web de Terravida</h2>",
      '<table cellpadding="6">',
      ...rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`),
      "</table>",
    ].join(""),
  };
}
