export type LotCategory = "panoramica" | "plana";
export type LotFilter = "todas" | LotCategory;

export type Lot = {
  id: string;
  name: string;
  /** Precio en UF. Única fuente de verdad: los pesos siempre se derivan de la UF. */
  priceUf: number;
  category: LotCategory;
  badge: { label: string; tone: "available" | "last" };
  description: string;
  image: string;
};

export const lots: readonly Lot[] = [
  {
    id: "convento-a-04",
    name: "Lote Convento A-04",
    priceUf: 1100,
    category: "panoramica",
    badge: { label: "Disponible", tone: "available" },
    description: "Lomaje suave con vista al valle. 5.000 m² con luz soterrada y Rol Propio.",
    image: "/images/parcela_post_1.jpg",
  },
  {
    id: "mirador-b-09",
    name: "Lote Mirador B-09",
    priceUf: 1450,
    category: "panoramica",
    badge: { label: "Disponible", tone: "available" },
    description: "Cota alta con vista al mar a lo lejos. 5.000 m² y luz soterrada.",
    // Foto provisional de Unsplash: reemplazar por una foto propia del lote.
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pradera-c-12",
    name: "Lote Pradera C-12",
    priceUf: 1350,
    category: "plana",
    badge: { label: "Última plana", tone: "last" },
    description: "Topografía 100% plana para construir de inmediato. 5.000 m².",
    // Foto provisional de Unsplash: reemplazar por una foto propia del lote.
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
  },
];

export const lotFilters: readonly { value: LotFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "panoramica", label: "Vista al mar / Lomaje" },
  { value: "plana", label: "Planas" },
];
