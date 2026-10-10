import { describe, expect, it } from "vitest";
import { lots } from "@/data/lots";
import { filterLots, findLot, minPriceUf } from "./lots";

describe("findLot", () => {
  it("encuentra un lote por id", () => {
    expect(findLot("mirador-b-09")?.name).toBe("Lote Mirador B-09");
  });
  it("devuelve undefined para un id desconocido", () => {
    expect(findLot("no-existe")).toBeUndefined();
  });
});

describe("filterLots", () => {
  it("devuelve todos con el filtro 'todas'", () => {
    expect(filterLots(lots, "todas")).toHaveLength(lots.length);
  });
  it("filtra por categoría", () => {
    expect(filterLots(lots, "plana").map((lot) => lot.id)).toEqual(["pradera-c-12"]);
  });
  it("devuelve una lista vacía si ningún lote coincide", () => {
    const onlyPanoramic = lots.filter((lot) => lot.category === "panoramica");
    expect(filterLots(onlyPanoramic, "plana")).toEqual([]);
  });
});

describe("minPriceUf", () => {
  it("devuelve el precio más bajo", () => {
    expect(minPriceUf(lots)).toBe(1100);
  });
});
