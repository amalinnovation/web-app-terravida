import { describe, expect, it } from "vitest";
import { buildLeadEmail, leadSchema } from "./leads";

describe("leadSchema", () => {
  it("acepta un lead válido y recorta espacios", () => {
    const result = leadSchema.safeParse({ name: "  Ana Pérez ", phone: "+56 9 1234 5678", date: "2026-10-15" });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Ana Pérez");
  });

  it("acepta la fecha vacía o ausente", () => {
    expect(leadSchema.safeParse({ name: "Ana", phone: "912345678", date: "" }).success).toBe(true);
    expect(leadSchema.safeParse({ name: "Ana", phone: "912345678" }).success).toBe(true);
  });

  it.each([
    ["nombre vacío", { name: " ", phone: "912345678" }],
    ["nombre demasiado largo", { name: "a".repeat(81), phone: "912345678" }],
    ["teléfono con letras", { name: "Ana", phone: "llámame" }],
    ["teléfono demasiado corto", { name: "Ana", phone: "1234" }],
    ["fecha con formato incorrecto", { name: "Ana", phone: "912345678", date: "15/10/2026" }],
    ["sin teléfono", { name: "Ana" }],
  ])("rechaza %s", (_label, input) => {
    expect(leadSchema.safeParse(input).success).toBe(false);
  });
});

describe("buildLeadEmail", () => {
  it("incluye los datos del lead", () => {
    const email = buildLeadEmail({ name: "Ana Pérez", phone: "+56 9 1234 5678", date: "2026-10-15" });
    expect(email.subject).toBe("Nueva solicitud de visita — Ana Pérez");
    expect(email.text).toContain("Teléfono: +56 9 1234 5678");
    expect(email.text).toContain("Fecha estimada: 15/10/2026");
    expect(email.html).toContain("Ana Pérez");
  });

  it("escapa HTML en los datos del usuario", () => {
    const email = buildLeadEmail({ name: '<script>alert("x")</script>', phone: "912345678" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("indica 'Por coordinar' sin fecha", () => {
    expect(buildLeadEmail({ name: "Ana", phone: "912345678" }).text).toContain("Fecha estimada: Por coordinar");
  });
});
