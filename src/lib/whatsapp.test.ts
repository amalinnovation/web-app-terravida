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
});

describe("simulationMessage", () => {
  it("incluye lote, pie, plazo y cuota con formato chileno", () => {
    const message = simulationMessage({
      lotName: "Lote Convento A-04",
      priceUf: 1100,
      downPaymentPct: 0.5,
      downPaymentUf: 550,
      months: 48,
      installmentUf: 11.458333,
    });
    expect(message).toContain("*Lote Convento A-04* (1.100 UF)");
    expect(message).toContain("Pie: 50% (550 UF)");
    expect(message).toContain("Plazo: 48 cuotas de ~11,46 UF");
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
