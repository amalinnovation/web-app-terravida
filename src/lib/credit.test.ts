import { describe, expect, it } from "vitest";
import { simulate } from "./credit";

const base = { priceUf: 1100, downPaymentPct: 0.5, months: 48, monthlyRate: 0, ufValue: 40000 };

describe("simulate", () => {
  it("divide el saldo en cuotas iguales cuando la tasa es 0", () => {
    const result = simulate(base);
    expect(result.downPaymentUf).toBe(550);
    expect(result.balanceUf).toBe(550);
    expect(result.installmentUf).toBeCloseTo(11.458333, 5);
  });

  it("deriva los pesos de la UF y redondea al peso", () => {
    const result = simulate(base);
    expect(result.downPaymentClp).toBe(22000000);
    expect(result.balanceClp).toBe(22000000);
    expect(result.installmentClp).toBe(458333);
  });

  it("calcula el pie del 30%", () => {
    const result = simulate({ ...base, downPaymentPct: 0.3, months: 12 });
    expect(result.downPaymentUf).toBeCloseTo(330, 6);
    expect(result.balanceUf).toBeCloseTo(770, 6);
    expect(result.installmentUf).toBeCloseTo(64.166667, 5);
  });

  it("usa amortización francesa cuando la tasa es mayor que 0", () => {
    const result = simulate({ ...base, priceUf: 2000, months: 12, monthlyRate: 0.01 });
    expect(result.installmentUf).toBeCloseTo(88.8488, 3);
  });

  it.each([
    ["plazo 0", { months: 0 }],
    ["plazo negativo", { months: -12 }],
    ["plazo no entero", { months: 12.5 }],
    ["pie negativo", { downPaymentPct: -0.1 }],
    ["pie mayor que 100%", { downPaymentPct: 1.2 }],
    ["precio 0", { priceUf: 0 }],
    ["tasa negativa", { monthlyRate: -0.01 }],
    ["UF no válida", { ufValue: Number.NaN }],
  ])("rechaza %s", (_label, override) => {
    expect(() => simulate({ ...base, ...override })).toThrow(RangeError);
  });
});
