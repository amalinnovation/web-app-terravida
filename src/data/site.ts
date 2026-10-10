export const site = {
  name: "TERRAVÍDA",
  tagline: "Parcelas & Naturaleza",
  project: "Refugio El Convento",
  location: "Santo Domingo",
  whatsappNumber: "56933773996",
  phones: ["+56 9 3377 3996"],
  instagram: {
    handle: "@terravida.parcelas",
    url: "https://www.instagram.com/terravida.parcelas/",
  },
  mapsUrl: "https://maps.google.com/?q=El+Convento+Santo+Domingo+Chile",
  visitSchedule: "Atención de miércoles a domingo en Refugio El Convento.",
} as const;

// Secciones de la portada. Los enlaces usan `/#id` para funcionar también desde /galeria.
export const navLinks = [
  { id: "pilares", label: "Pilares", longLabel: "Pilares del proyecto" },
  { id: "galeria", label: "Galería", longLabel: "Galería de fotos y videos" },
  { id: "catalogo", label: "Lotes", longLabel: "Catálogo de lotes" },
  { id: "simulador", label: "Simulador", longLabel: "Simulador de crédito" },
  { id: "ubicacion", label: "Ubicación", longLabel: "Ubicación y rutas" },
] as const;
