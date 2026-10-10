import { lots, type Lot, type PriceTier } from "@/data/lots";

const ENTRY_MAX_UF = 1200;
const HIGH_MIN_UF = 1600;

export function findLot(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

export function filterLots(items: readonly Lot[], tier: PriceTier): Lot[] {
  switch (tier) {
    case "entrada":
      return items.filter((lot) => lot.priceUf <= ENTRY_MAX_UF);
    case "media":
      return items.filter((lot) => lot.priceUf > ENTRY_MAX_UF && lot.priceUf < HIGH_MIN_UF);
    case "alta":
      return items.filter((lot) => lot.priceUf >= HIGH_MIN_UF);
    default:
      return [...items];
  }
}

export function minPriceUf(items: readonly Lot[]): number {
  return Math.min(...items.map((lot) => lot.priceUf));
}
