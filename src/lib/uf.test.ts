import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cacheLifeMock } = vi.hoisted(() => ({ cacheLifeMock: vi.fn() }));
vi.mock("next/cache", () => ({ cacheLife: cacheLifeMock }));

import { creditConfig } from "@/data/credit";
import { getUf } from "./uf";

const fallback = { value: creditConfig.fallbackUfValue, date: null, isFallback: true };

function mockFetch(response: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body };
}

describe("getUf", () => {
  beforeEach(() => {
    cacheLifeMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("devuelve el valor más reciente de la serie y lo cachea por un día", async () => {
    const fetchMock = mockFetch(
      jsonResponse({
        serie: [
          { fecha: "2026-10-10T03:00:00.000Z", valor: 41136.24 },
          { fecha: "2026-10-09T03:00:00.000Z", valor: 41130.94 },
        ],
      }),
    );
    expect(await getUf()).toEqual({ value: 41136.24, date: "2026-10-10T03:00:00.000Z", isFallback: false });
    expect(fetchMock).toHaveBeenCalledWith("https://mindicador.cl/api/uf", expect.anything());
    expect(cacheLifeMock).toHaveBeenCalledExactlyOnceWith("days");
  });

  it("usa el respaldo si la red falla y reintenta antes de un día", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await getUf()).toEqual(fallback);
    expect(cacheLifeMock).toHaveBeenCalledExactlyOnceWith("hours");
  });

  it("usa el respaldo si la API responde con error", async () => {
    mockFetch(jsonResponse({}, false));
    expect(await getUf()).toEqual(fallback);
  });

  it.each([
    ["serie vacía", { serie: [] }],
    ["sin serie", { codigo: "uf" }],
    ["valor como texto", { serie: [{ fecha: "2026-10-10T03:00:00.000Z", valor: "41136" }] }],
    ["valor absurdamente bajo", { serie: [{ fecha: "2026-10-10T03:00:00.000Z", valor: 4 }] }],
    ["valor absurdamente alto", { serie: [{ fecha: "2026-10-10T03:00:00.000Z", valor: 9000000 }] }],
    ["sin fecha", { serie: [{ valor: 41136.24 }] }],
    ["cuerpo nulo", null],
  ])("usa el respaldo con %s", async (_label, body) => {
    mockFetch(jsonResponse(body));
    expect(await getUf()).toEqual(fallback);
  });
});
