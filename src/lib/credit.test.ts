import { describe, expect, it } from "vitest";
import { simulate } from "./credit";

const base = { priceUf: 1100, downPaymentPct: 0.5, ufValue: 40000 };

describe("simulate", () => {
  it("separa el precio en pie y saldo", () => {
    const result = simulate(base);
    expect(result.downPaymentUf).toBe(550);
    expect(result.balanceUf).toBe(550);
  });

  it("deriva los pesos de la UF y redondea al peso", () => {
    const result = simulate({ ...base, priceUf: 1750, ufValue: 41136.24 });
    expect(result.priceClp).toBe(71988420);
    expect(result.downPaymentClp).toBe(35994210);
    expect(result.balanceClp).toBe(35994210);
  });

  it("no deja saldo cuando el pago es contado", () => {
    const result = simulate({ ...base, downPaymentPct: 1 });
    expect(result.downPaymentUf).toBe(1100);
    expect(result.balanceUf).toBe(0);
    expect(result.balanceClp).toBe(0);
  });

  it.each([
    ["pie negativo", { downPaymentPct: -0.1 }],
    ["pie mayor que 100%", { downPaymentPct: 1.2 }],
    ["precio 0", { priceUf: 0 }],
    ["precio no numérico", { priceUf: Number.NaN }],
    ["UF no válida", { ufValue: Number.NaN }],
  ])("rechaza %s", (_label, override) => {
    expect(() => simulate({ ...base, ...override })).toThrow(RangeError);
  });
});
