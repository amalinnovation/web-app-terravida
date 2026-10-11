import { lots, type Lot } from "@/data/lots";

export function findLot(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

export function minPriceUf(items: readonly Lot[]): number {
  return Math.min(...items.map((lot) => lot.priceUf));
}
