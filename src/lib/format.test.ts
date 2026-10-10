import { describe, expect, it } from "vitest";
import { formatClp, formatDate, formatM2, formatPercent, formatUf } from "./format";

describe("formatUf", () => {
  it("agrupa miles con punto y sin decimales por defecto", () => {
    expect(formatUf(1100)).toBe("1.100 UF");
  });
  it("usa coma decimal y redondea a los decimales pedidos", () => {
    expect(formatUf(11.458333, 2)).toBe("11,46 UF");
  });
});

describe("formatClp", () => {
  it("redondea al peso y agrupa miles", () => {
    expect(formatClp(45000000.4)).toBe("$45.000.000");
    expect(formatClp(458333.33)).toBe("$458.333");
  });
});

describe("formatPercent", () => {
  it("convierte una fracción en porcentaje entero", () => {
    expect(formatPercent(0.3)).toBe("30%");
    expect(formatPercent(0.5)).toBe("50%");
  });
});

describe("formatDate", () => {
  it("formatea día/mes/año en hora de Chile", () => {
    expect(formatDate("2026-10-10T03:00:00.000Z")).toBe("10/10/2026");
  });
});

describe("formatM2", () => {
  it("agrupa miles y agrega la unidad", () => {
    expect(formatM2(5011)).toBe("5.011 m²");
    expect(formatM2(0)).toBe("0 m²");
  });
});
