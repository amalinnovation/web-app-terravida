import { lots, type Lot, type LotFilter } from "@/data/lots";

export function findLot(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

export function filterLots(items: readonly Lot[], filter: LotFilter): Lot[] {
  return filter === "todas" ? [...items] : items.filter((lot) => lot.category === filter);
}

export function minPriceUf(items: readonly Lot[]): number {
  return Math.min(...items.map((lot) => lot.priceUf));
}
