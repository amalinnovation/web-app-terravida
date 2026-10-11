export type Lot = {
  id: string;
  name: string;
  surfaceM2: number;
  /** Superficie afecta a servidumbre, en m². */
  easementM2: number;
  /** Precio en UF. Única fuente de verdad: los pesos siempre se derivan de la UF. */
  priceUf: number;
};

// Transcrito de public/assets/precios.jpeg (listado de precios, página 2 de 2).
// Columnas: número, superficie m², servidumbre m², UF.
// En las parcelas 7, 19 y 20 el listado muestra una UF que no calza con su monto en pesos;
// se usa la UF que corresponde al monto en pesos (1.750, 1.400 y 1.400).
// El listado repite el número 43; la segunda fila queda como "43-B".
const priceList: readonly [label: string, surfaceM2: number, easementM2: number, priceUf: number][] = [
  ["1", 5011, 93, 1200],
  ["2", 5673, 1053, 1200],
  ["3", 5002, 1073, 1200],
  ["4", 5062, 688, 1200],
  ["5", 5022, 252, 1300],
  ["6", 5013, 273, 1700],
  ["7", 5033, 428, 1750],
  ["8", 5078, 373, 3100],
  ["9", 5332, 195, 1800],
  ["10", 5382, 195, 1800],
  ["11", 5063, 202, 1800],
  ["12", 5001, 214, 1600],
  ["13", 5092, 214, 1600],
  ["14", 5036, 270, 1400],
  ["15", 5275, 701, 1400],
  ["16", 5227, 1414, 1300],
  ["17", 5049, 257, 1300],
  ["18", 5049, 261, 1300],
  ["19", 5038, 557, 1400],
  ["20", 5040, 338, 1400],
  ["21", 5396, 312, 1400],
  ["22", 5506, 376, 1400],
  ["23", 5424, 148, 1400],
  ["24", 5831, 157, 1400],
  ["25", 5170, 157, 1400],
  ["26", 5130, 177, 1400],
  ["27", 5277, 123, 1400],
  ["28", 5381, 519, 1400],
  ["29", 5005, 533, 1100],
  ["30", 5012, 591, 1100],
  ["31", 5381, 400, 1100],
  ["32", 5065, 270, 1300],
  ["33", 5380, 250, 1300],
  ["34", 5093, 670, 1100],
  ["35", 6034, 84, 1100],
  ["36", 5022, 404, 1100],
  ["37", 6223, 517, 1100],
  ["38", 5014, 717, 1800],
  ["39", 5148, 23, 1100],
  ["40", 5889, 41, 1100],
  ["41", 5138, 0, 1100],
  ["42", 5172, 0, 1100],
  ["43", 5172, 0, 1100],
  ["43-B", 5047, 0, 1200],
  ["44", 5089, 82, 1200],
  ["45", 5113, 170, 1200],
  ["46", 5271, 243, 1750],
  ["47", 5165, 808, 1800],
  ["48", 5027, 894, 3150],
  ["49", 5014, 894, 1750],
  ["50", 5001, 795, 1300],
  ["51", 5001, 0, 1300],
  ["52", 5458, 410, 1200],
  ["53", 5134, 213, 1200],
];

export const lots: readonly Lot[] = priceList.map(([label, surfaceM2, easementM2, priceUf]) => ({
  id: label.toLowerCase(),
  name: `Parcela ${label}`,
  surfaceM2,
  easementM2,
  priceUf,
}));

/** Parcelas que se muestran con foto. Las fotos son del proyecto, no de cada parcela. */
export const featuredLots: readonly { lotId: string; tag: string; image: string; imageAlt: string }[] = [
  {
    lotId: "37",
    tag: "Mayor superficie",
    image: "/assets/foto-03.jpeg",
    imageAlt: "Pradera verde del proyecto con el sol bajando sobre el valle",
  },
  {
    lotId: "29",
    tag: "Precio de entrada",
    image: "/assets/foto-04.jpeg",
    imageAlt: "Camino interior del proyecto con estacas de deslinde y el mar al fondo",
  },
  {
    lotId: "48",
    tag: "Parcela premium",
    image: "/assets/foto-05.jpeg",
    imageAlt: "Vista al océano desde el proyecto al atardecer",
  },
];
