import { afterEach, describe, expect, it, vi } from "vitest";
import { creditConfig, maxTerm } from "./credit";

describe("condiciones de crédito derivadas", () => {
  afterEach(() => {
    vi.doUnmock("./credit");
    vi.resetModules();
  });

  it("maxTerm sale de la configuración", () => {
    expect(maxTerm).toBe(Math.max(...creditConfig.termOptions));
  });

  it("el crédito exige 50% de pie y la reserva es de $500.000", () => {
    expect(creditConfig.downPaymentPct).toBe(0.5);
    expect(creditConfig.reservationClp).toBe(500000);
  });

  it("el contenido sigue al plazo máximo cuando cambia la configuración", async () => {
    vi.resetModules();
    vi.doMock("./credit", () => ({ maxTerm: 36, creditConfig: { downPaymentPct: 0.5, deedDays: "10 a 15" } }));
    const { heroStats, pillars } = await import("./pillars");

    expect(heroStats.find((item) => item.label === "Crédito")?.value).toBe("36 cuotas");
    expect(pillars.find((item) => item.title === "Crédito Directo")?.description).toContain("hasta 36 cuotas");
  });
});
