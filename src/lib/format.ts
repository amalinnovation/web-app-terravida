const LOCALE = "es-CL";

function formatNumber(value: number, decimals: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: "always",
  }).format(value);
}

export function formatUf(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)} UF`;
}

export function formatM2(value: number): string {
  return `${formatNumber(value, 0)} m²`;
}

export function formatClp(value: number): string {
  return `$${formatNumber(Math.round(value), 0)}`;
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santiago",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}
