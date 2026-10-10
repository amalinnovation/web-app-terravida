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
  tiktok: {
    handle: "@terravida.parcelas",
    url: "https://www.tiktok.com/@terravida.parcelas",
  },
  mapsUrl: "https://maps.google.com/?q=-33.788109,-71.603867",
  visitSchedule: "Atención de miércoles a domingo en Refugio El Convento.",
} as const;

// Secciones de la portada. Los enlaces usan `/#id` para funcionar también desde /galeria.
export const navLinks = [
  { id: "pilares", label: "Pilares", longLabel: "Pilares del proyecto" },
  { id: "galeria", label: "Galería", longLabel: "Galería de fotos y videos" },
  { id: "catalogo", label: "Lotes", longLabel: "Catálogo de lotes" },
  { id: "simulador", label: "Simulador", longLabel: "Simulador de compra" },
  { id: "ubicacion", label: "Ubicación", longLabel: "Ubicación y rutas" },
] as const;
