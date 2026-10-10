import { afterEach, describe, expect, it, vi } from "vitest";
import { creditConfig, maxTerm, minDownPayment } from "./credit";

describe("condiciones de crédito derivadas", () => {
  afterEach(() => {
    vi.doUnmock("./credit");
    vi.resetModules();
  });

  it("maxTerm y minDownPayment salen de la configuración", () => {
    expect(maxTerm).toBe(Math.max(...creditConfig.termOptions));
    expect(minDownPayment).toBe(Math.min(...creditConfig.downPaymentOptions));
  });

  it("el contenido sigue al plazo máximo cuando cambia la configuración", async () => {
    vi.resetModules();
    vi.doMock("./credit", () => ({ maxTerm: 36, minDownPayment: 0.3 }));
    const { heroStats, pillars } = await import("./pillars");

    expect(heroStats.find((item) => item.label === "Crédito")?.value).toBe("36 cuotas");
    expect(pillars.find((item) => item.title === "Crédito Directo")?.description).toContain("Hasta 36 cuotas");
  });
});
