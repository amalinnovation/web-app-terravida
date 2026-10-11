import { describe, expect, it } from "vitest";
import { featuredLots, lots } from "@/data/lots";
import { findLot, minPriceUf } from "./lots";

describe("listado de parcelas", () => {
  it("contiene las 54 filas del listado de precios, con ids únicos", () => {
    expect(lots).toHaveLength(54);
    expect(new Set(lots.map((lot) => lot.id)).size).toBe(54);
  });

  it("toda parcela tiene superficie y precio positivos", () => {
    for (const lot of lots) {
      expect(lot.surfaceM2).toBeGreaterThan(0);
      expect(lot.priceUf).toBeGreaterThan(0);
      expect(lot.easementM2).toBeGreaterThanOrEqual(0);
    }
  });

  it("las parcelas destacadas existen en el listado", () => {
    expect(featuredLots.length).toBeGreaterThan(0);
    for (const featured of featuredLots) {
      expect(findLot(featured.lotId)).toBeDefined();
    }
  });
});

describe("findLot", () => {
  it("encuentra una parcela por id", () => {
    expect(findLot("37")).toMatchObject({ name: "Parcela 37", surfaceM2: 6223, priceUf: 1100 });
  });
  it("distingue las dos filas numeradas 43", () => {
    expect(findLot("43")?.surfaceM2).toBe(5172);
    expect(findLot("43-b")?.surfaceM2).toBe(5047);
  });
  it("devuelve undefined para un id desconocido", () => {
    expect(findLot("no-existe")).toBeUndefined();
  });
});

describe("minPriceUf", () => {
  it("devuelve el precio más bajo del listado", () => {
    expect(minPriceUf(lots)).toBe(1100);
  });
});
