import { cacheLife } from "next/cache";
import { creditConfig } from "@/data/credit";

export type UfQuote = {
  value: number;
  /** Fecha ISO del valor, o null cuando se usa el respaldo. */
  date: string | null;
  isFallback: boolean;
};

const UF_ENDPOINT = "https://mindicador.cl/api/uf";
// Rango de cordura: descarta respuestas corruptas sin atarse a un valor exacto.
const MIN_PLAUSIBLE_UF = 10_000;
const MAX_PLAUSIBLE_UF = 500_000;

async function fetchLatestUf(): Promise<{ value: number; date: string }> {
  const response = await fetch(UF_ENDPOINT, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`mindicador.cl respondió ${response.status}`);

  const data = (await response.json()) as { serie?: { fecha?: unknown; valor?: unknown }[] } | null;
  const latest = data?.serie?.[0];
  const value = latest?.valor;
  const date = latest?.fecha;
  if (typeof value !== "number" || value < MIN_PLAUSIBLE_UF || value > MAX_PLAUSIBLE_UF || typeof date !== "string") {
    throw new Error("mindicador.cl devolvió un valor de UF no válido");
  }
  return { value, date };
}

export async function getUf(): Promise<UfQuote> {
  "use cache";

  let latest: { value: number; date: string } | null = null;
  try {
    latest = await fetchLatestUf();
  } catch (error) {
    console.error("No se pudo obtener la UF; se usa el valor de respaldo.", error);
  }

  if (!latest) {
    // El respaldo se cachea menos tiempo para reintentar pronto tras una caída de la API.
    cacheLife("hours");
    return { value: creditConfig.fallbackUfValue, date: null, isFallback: true };
  }

  cacheLife("days");
  return { ...latest, isFallback: false };
}
