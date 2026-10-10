import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { POST } from "./route";

const validLead = { name: "Ana Pérez", phone: "+56 9 1234 5678", date: "2026-10-15" };

function request(body: unknown) {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("LEADS_TO_EMAIL", "ventas@example.com");
    vi.stubEnv("LEADS_FROM_EMAIL", "Terravida <visitas@example.com>");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("envía el correo y responde 200", async () => {
    const response = await POST(request(validLead));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Terravida <visitas@example.com>",
        to: "ventas@example.com",
        subject: "Nueva solicitud de visita — Ana Pérez",
      }),
    );
  });

  it("responde 400 si el cuerpo no es JSON", async () => {
    const response = await POST(request("esto no es json"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("responde 400 si el lead no es válido", async () => {
    const response = await POST(request({ name: "", phone: "abc" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_lead" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("responde 200 sin enviar si el campo trampa viene relleno", async () => {
    const response = await POST(request({ ...validLead, website: "http://spam.example" }));
    expect(response.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("responde 503 si falta configuración", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await POST(request(validLead));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "not_configured" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("responde 502 si el proveedor devuelve un error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "dominio no verificado" } });
    const response = await POST(request(validLead));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "send_failed" });
  });

  it("responde 502 si el proveedor lanza una excepción", async () => {
    sendMock.mockRejectedValue(new Error("network"));
    const response = await POST(request(validLead));
    expect(response.status).toBe(502);
  });
});
