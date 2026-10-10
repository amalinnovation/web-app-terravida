export const site = {
  name: "TERRAVÍDA",
  tagline: "Parcelas & Naturaleza",
  project: "Refugio El Convento",
  location: "Santo Domingo",
  whatsappNumber: "56933722243",
  phones: ["+56 9 3372 2243", "+56 9 3377 3996"],
  instagram: {
    handle: "@terravida.parcelas",
    url: "https://www.instagram.com/terravida.parcelas/",
  },
  mapsUrl: "https://maps.google.com/?q=El+Convento+Santo+Domingo+Chile",
  visitSchedule: "Atención de miércoles a domingo en Refugio El Convento.",
} as const;

export const navLinks = [
  { href: "#pilares", label: "Pilares", longLabel: "Pilares del proyecto" },
  { href: "#catalogo", label: "Lotes", longLabel: "Catálogo de lotes" },
  { href: "#simulador", label: "Simulador", longLabel: "Simulador de crédito" },
  { href: "#ubicacion", label: "Ubicación", longLabel: "Ubicación y rutas" },
] as const;
