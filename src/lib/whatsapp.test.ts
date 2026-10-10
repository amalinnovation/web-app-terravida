import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, simulationMessage, visitRequestMessage } from "./whatsapp";

describe("buildWhatsAppUrl", () => {
  it("apunta al número de Terravida y codifica el mensaje", () => {
    const url = buildWhatsAppUrl("Hola, ¿qué tal? & más");
    expect(url.startsWith("https://wa.me/56933722243?text=")).toBe(true);
    expect(url).not.toContain(" ");
    expect(url).not.toContain("&");
    expect(decodeURIComponent(url.split("?text=")[1])).toBe("Hola, ¿qué tal? & más");
  });

  it("acepta otro número y descarta espacios y símbolos", () => {
    expect(buildWhatsAppUrl("Hola", "+56 9 3377 3996")).toBe("https://wa.me/56933773996?text=Hola");
  });
});

describe("simulationMessage", () => {
  it("con crédito incluye parcela, pie, saldo y plazo, y pide la cuota", () => {
    const message = simulationMessage({
      payment: "credito",
      lotName: "Parcela 37",
      priceUf: 1100,
      downPaymentPct: 0.5,
      downPaymentUf: 550,
      balanceUf: 550,
      months: 48,
    });
    expect(message).toContain("*Parcela 37* (1.100 UF)");
    expect(message).toContain("Pie: 50% (550 UF)");
    expect(message).toContain("Saldo: 550 UF en 48 cuotas");
    expect(message).toContain("valor de la cuota");
  });

  it("al contado pide el descuento y no menciona cuotas", () => {
    const message = simulationMessage({ payment: "contado", lotName: "Parcela 37", priceUf: 1100 });
    expect(message).toContain("*Parcela 37* (1.100 UF)");
    expect(message).toContain("pago contado");
    expect(message).not.toContain("cuotas");
  });
});

describe("visitRequestMessage", () => {
  it("formatea la fecha como día/mes/año", () => {
    const message = visitRequestMessage({ name: "Ana Pérez", phone: "+56 9 1234 5678", date: "2026-10-15" });
    expect(message).toContain("Nombre: Ana Pérez");
    expect(message).toContain("Tel: +56 9 1234 5678");
    expect(message).toContain("Fecha: 15/10/2026");
  });
  it("indica 'Por coordinar' si no hay fecha", () => {
    expect(visitRequestMessage({ name: "Ana", phone: "912345678" })).toContain("Fecha: Por coordinar");
    expect(visitRequestMessage({ name: "Ana", phone: "912345678", date: "" })).toContain("Fecha: Por coordinar");
  });
});
