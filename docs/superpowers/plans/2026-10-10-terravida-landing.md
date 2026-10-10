# Terravida Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la landing de Terravida en Next.js con paridad funcional respecto de https://terravida.tq9grx.easypanel.host/, simulador con UF del día, leads por WhatsApp y correo, y documentación de despliegue en Vercel.

**Architecture:** Una sola página con App Router. `page.tsx` (servidor) obtiene la UF con revalidación diaria y compone secciones; la lógica vive en funciones puras de `src/lib` con tests, el contenido en `src/data`, y solo los componentes con interacción son de cliente. Un contexto de cliente comparte el lote seleccionado entre catálogo y simulador; una API route envía los leads por correo.

**Tech Stack:** Next.js 16.4 (App Router, TypeScript), React 19, Tailwind CSS 4.3, lucide-react 1.x, Zod 4, Resend 6, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-10-terravida-landing-design.md`

## Global Constraints

- Node >= 20.9.0. Gestor de paquetes: npm.
- Solo componentes funcionales. Componentes de servidor por defecto; `"use client"` solo en `Header`, `MobileMenu`, `Reveal`, `LotSelectionProvider`, `Catalog`, `Simulator` y `VisitForm`.
- Dependencias: `sections` usa `ui`, `data` y `lib`; `lib` no importa componentes; `data` no importa nada del proyecto salvo tipos.
- El precio en UF es la única fuente de verdad. Nunca se escribe un valor en pesos a mano: siempre `UF × ufValue`.
- Opciones de pie: 30% y 50%. Plazos: 12, 24, 36 y 48. `monthlyRate`: 0.
- Formato numérico `es-CL`: miles con punto, decimales con coma.
- WhatsApp: `56933722243`. Teléfonos: `+56 9 3372 2243` y `+56 9 3377 3996`. Instagram: `https://www.instagram.com/terravida.parcelas/`.
- Variables de entorno: `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `LEADS_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`.
- Accesibilidad: foco visible, objetivos táctiles de al menos 44 px (`min-h-11`), animaciones desactivadas con `prefers-reduced-motion`.
- Sin `vercel.json`.
- Textos de interfaz en español de Chile.
- Los assets de la referencia ya están descargados en `/private/tmp/claude-502/-Users-nicolas-amal-workspace-web-app-terravida/85339c69-9c85-4c8c-a2c5-efe9639f494b/scratchpad/site/` (`logo.png` 150×150, `parcela_post_1.jpg` 640×639). Si esa carpeta ya no existe, descargarlos de `https://terravida.tq9grx.easypanel.host/assets/<archivo>`.

## Review Focus

1. La API de la UF falla, tarda o devuelve un valor absurdo: la página debe renderizar con el valor de respaldo y decir "valor de referencia". Test en Task 4.
2. El lead trae HTML en el nombre (`<script>`): el correo debe mostrarlo escapado. Test en Task 5.
3. `/api/leads` recibe un cuerpo que no es JSON o le faltan variables de entorno: debe responder 400 o 503, nunca 500 sin controlar. Test en Task 5.
4. Un filtro del catálogo queda sin lotes (por ejemplo, se vende la última plana): debe mostrarse un estado vacío, no una grilla en blanco. Test de `filterLots` en Task 3, estado vacío en Task 8.
5. Se pide un lote inexistente o una simulación con plazo 0 o pie fuera de rango: `findLot` devuelve `undefined` y la selección no cambia; `simulate` lanza `RangeError` en vez de devolver `Infinity`/`NaN`. Tests en Task 2 y Task 3.

---

### Task 1: Scaffold, tooling y tema visual

**Files:**
- Create: proyecto Next.js en la raíz (`package.json`, `src/app/*`, etc.)
- Create: `vitest.config.ts`, `.env.example`, `public/images/logo.png`, `public/images/parcela_post_1.jpg`, `src/app/icon.png`
- Modify: `next.config.ts`, `package.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces: clases Tailwind `bg-brand-black`, `bg-brand-surface`, `bg-brand-card`, `border-brand-border`, `text-brand-gold-light`, `text-brand-gold`, `text-brand-gold-mid`, `text-brand-gold-dark`, `text-brand-olive`, `text-brand-ivory`, `text-brand-linen`, `text-brand-muted`, `font-sans`, `font-serif`, `font-display`, `shadow-gold-glow`, `shadow-dark-card`; clases CSS `gold-btn`, `gold-gradient-text`, `glass-card`, `reticle-corner`, `bg-grain`, `hero-title`, `reveal`, `is-visible`; alias de import `@/` → `src/`; script `npm test`.

- [ ] **Step 1: Generar el proyecto**

```bash
cd /Users/nicolas/amal-workspace/web-app-terravida
npx create-next-app@16.4.0 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes
```

La carpeta `docs/` existente no bloquea el generador. Si algún flag es rechazado, ejecutar `npx create-next-app@16.4.0 --help` y usar el equivalente.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install lucide-react@^1.55.0 zod@^4.6.5 resend@^6.32.1
npm install -D vitest@^5.0.3
```

- [ ] **Step 3: Configurar Vitest**

Crear `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

En `package.json`, agregar a `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Copiar assets y variables de ejemplo**

```bash
SRC="/private/tmp/claude-502/-Users-nicolas-amal-workspace-web-app-terravida/85339c69-9c85-4c8c-a2c5-efe9639f494b/scratchpad/site"
mkdir -p public/images
cp "$SRC/logo.png" public/images/logo.png
cp "$SRC/parcela_post_1.jpg" public/images/parcela_post_1.jpg
cp "$SRC/logo.png" src/app/icon.png
rm -f src/app/favicon.ico public/*.svg
```

Crear `.env.example`:

```bash
# Clave de Resend (https://resend.com/api-keys). Solo servidor.
RESEND_API_KEY=
# Casilla que recibe las solicitudes de visita.
LEADS_TO_EMAIL=
# Remitente verificado en Resend, por ejemplo: Terravida <visitas@tudominio.cl>
LEADS_FROM_EMAIL=
# URL pública del sitio, sin barra final.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Confirmar que `.gitignore` ignora `.env*` pero no `.env.example`; si lo ignora, agregar la línea `!.env.example`.

- [ ] **Step 5: Permitir imágenes de Unsplash**

Reemplazar `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Tema y utilidades**

Reemplazar `src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-garamond), ui-serif, Georgia, serif;
  --font-display: var(--font-cinzel), ui-serif, Georgia, serif;
}

@theme {
  --color-brand-black: #0a0c0a;
  --color-brand-surface: #111411;
  --color-brand-card: #151914;
  --color-brand-border: #222720;
  --color-brand-gold-light: #f0dfc5;
  --color-brand-gold: #cbb07e;
  --color-brand-gold-mid: #b89762;
  --color-brand-gold-dark: #8e7246;
  --color-brand-olive: #62734f;
  --color-brand-olive-dark: #3a472e;
  --color-brand-ivory: #f4f2ec;
  --color-brand-linen: #d6d3ca;
  --color-brand-muted: #a09e95;

  --shadow-gold-glow: 0 0 35px -5px rgb(203 176 126 / 0.22);
  --shadow-dark-card: 0 20px 45px -15px rgb(0 0 0 / 0.85);
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 5.5rem;
}

body {
  overflow-x: hidden;
}

::selection {
  background: var(--color-brand-gold);
  color: var(--color-brand-black);
}

:focus-visible {
  outline: 2px solid var(--color-brand-gold-light);
  outline-offset: 2px;
}

@layer components {
  .bg-grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  }

  .gold-gradient-text {
    background: linear-gradient(135deg, #f5e6d0 0%, #d8be90 35%, #cbb07e 70%, #9e7d4c 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .gold-btn {
    background: linear-gradient(135deg, #dfcaab 0%, #cbb07e 50%, #a88753 100%);
    color: var(--color-brand-black);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    touch-action: manipulation;
  }
  .gold-btn:hover {
    background: linear-gradient(135deg, #f0e0c8 0%, #d8be90 50%, #b89762 100%);
    box-shadow: 0 0 25px rgb(203 176 126 / 0.45);
    transform: translateY(-1px);
  }
  .gold-btn:active {
    transform: scale(0.98);
  }

  .glass-card {
    background: rgb(17 20 17 / 0.88);
    backdrop-filter: blur(14px);
    border: 1px solid rgb(203 176 126 / 0.2);
  }

  .reticle-corner {
    position: relative;
  }
  .reticle-corner::before,
  .reticle-corner::after {
    content: "+";
    position: absolute;
    font-family: monospace;
    font-size: 11px;
    color: rgb(203 176 126 / 0.35);
    pointer-events: none;
  }
  .reticle-corner::before {
    top: 6px;
    right: 8px;
  }
  .reticle-corner::after {
    bottom: 6px;
    left: 8px;
  }

  .hero-title {
    font-size: clamp(2.25rem, 4.8vw, 4rem);
    line-height: 1.08;
  }

  .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.7s ease-out,
      transform 0.7s ease-out;
  }
  .reveal.is-visible {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .gold-btn,
  .gold-btn:hover,
  .gold-btn:active {
    transition: none;
    transform: none;
  }
}
```

- [ ] **Step 7: Layout con fuentes y metadata**

Reemplazar `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
});
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "TERRAVÍDA — Parcelas & Naturaleza | Refugio El Convento, Santo Domingo";
const description =
  "Parcelas exclusivas de 5.000 m² en Refugio El Convento, Santo Domingo. Rol propio, luz soterrada y crédito directo en hasta 48 cuotas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: "Terravida",
    title,
    description,
    images: [{ url: "/images/parcela_post_1.jpg", width: 640, height: 639, alt: "Parcela Terravida" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/parcela_post_1.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0a0c0a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={`${garamond.variable} ${cinzel.variable} ${jakarta.variable}`}>
      <body className="bg-grain relative min-h-screen bg-brand-black font-sans text-brand-ivory antialiased">
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
```

Reemplazar `src/app/page.tsx` por una página mínima (se completa en Task 10):

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display gold-gradient-text text-3xl tracking-[0.18em]">TERRAVÍDA</h1>
    </main>
  );
}
```

- [ ] **Step 8: Verificar**

Run: `npm run lint && npm run build`
Expected: ambos terminan sin errores. (`npm test` aún no tiene tests y sale con error "No test files found"; es esperado en este punto.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Terravida theme and tooling"
```

---

### Task 2: Formato y cálculo del crédito

**Files:**
- Create: `src/lib/format.ts`, `src/lib/credit.ts`
- Test: `src/lib/format.test.ts`, `src/lib/credit.test.ts`

**Interfaces:**
- Produces:
  - `formatUf(value: number, decimals?: number): string` → `"1.100 UF"`, `"11,46 UF"`
  - `formatClp(value: number): string` → `"$45.000.000"`
  - `formatPercent(fraction: number): string` → `"30%"`
  - `formatDate(iso: string): string` → `"10/10/2026"` (zona `America/Santiago`)
  - `type SimulationInput = { priceUf: number; downPaymentPct: number; months: number; monthlyRate: number; ufValue: number }`
  - `type SimulationResult = { downPaymentUf: number; balanceUf: number; installmentUf: number; downPaymentClp: number; balanceClp: number; installmentClp: number }`
  - `simulate(input: SimulationInput): SimulationResult` (lanza `RangeError` con entradas no válidas)

- [ ] **Step 1: Escribir los tests**

`src/lib/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatClp, formatDate, formatPercent, formatUf } from "./format";

describe("formatUf", () => {
  it("agrupa miles con punto y sin decimales por defecto", () => {
    expect(formatUf(1100)).toBe("1.100 UF");
  });
  it("usa coma decimal y redondea a los decimales pedidos", () => {
    expect(formatUf(11.458333, 2)).toBe("11,46 UF");
  });
});

describe("formatClp", () => {
  it("redondea al peso y agrupa miles", () => {
    expect(formatClp(45000000.4)).toBe("$45.000.000");
    expect(formatClp(458333.33)).toBe("$458.333");
  });
});

describe("formatPercent", () => {
  it("convierte una fracción en porcentaje entero", () => {
    expect(formatPercent(0.3)).toBe("30%");
    expect(formatPercent(0.5)).toBe("50%");
  });
});

describe("formatDate", () => {
  it("formatea día/mes/año en hora de Chile", () => {
    expect(formatDate("2026-10-10T03:00:00.000Z")).toBe("10/10/2026");
  });
});
```

`src/lib/credit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { simulate } from "./credit";

const base = { priceUf: 1100, downPaymentPct: 0.5, months: 48, monthlyRate: 0, ufValue: 40000 };

describe("simulate", () => {
  it("divide el saldo en cuotas iguales cuando la tasa es 0", () => {
    const result = simulate(base);
    expect(result.downPaymentUf).toBe(550);
    expect(result.balanceUf).toBe(550);
    expect(result.installmentUf).toBeCloseTo(11.458333, 5);
  });

  it("deriva los pesos de la UF y redondea al peso", () => {
    const result = simulate(base);
    expect(result.downPaymentClp).toBe(22000000);
    expect(result.balanceClp).toBe(22000000);
    expect(result.installmentClp).toBe(458333);
  });

  it("calcula el pie del 30%", () => {
    const result = simulate({ ...base, downPaymentPct: 0.3, months: 12 });
    expect(result.downPaymentUf).toBeCloseTo(330, 6);
    expect(result.balanceUf).toBeCloseTo(770, 6);
    expect(result.installmentUf).toBeCloseTo(64.166667, 5);
  });

  it("usa amortización francesa cuando la tasa es mayor que 0", () => {
    const result = simulate({ ...base, priceUf: 2000, months: 12, monthlyRate: 0.01 });
    expect(result.installmentUf).toBeCloseTo(88.8488, 3);
  });

  it.each([
    ["plazo 0", { months: 0 }],
    ["plazo negativo", { months: -12 }],
    ["plazo no entero", { months: 12.5 }],
    ["pie negativo", { downPaymentPct: -0.1 }],
    ["pie mayor que 100%", { downPaymentPct: 1.2 }],
    ["precio 0", { priceUf: 0 }],
    ["tasa negativa", { monthlyRate: -0.01 }],
    ["UF no válida", { ufValue: Number.NaN }],
  ])("rechaza %s", (_label, override) => {
    expect(() => simulate({ ...base, ...override })).toThrow(RangeError);
  });
});
```

- [ ] **Step 2: Confirmar que fallan**

Run: `npm test`
Expected: FAIL, no se pueden resolver `./format` ni `./credit`.

- [ ] **Step 3: Implementar**

`src/lib/format.ts`:

```ts
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
```

`src/lib/credit.ts`:

```ts
export type SimulationInput = {
  priceUf: number;
  /** Fracción del precio que se paga como pie, entre 0 y 1. */
  downPaymentPct: number;
  months: number;
  /** Tasa mensual como fracción (0.01 = 1%). 0 significa sin interés. */
  monthlyRate: number;
  /** Valor de 1 UF en pesos. */
  ufValue: number;
};

export type SimulationResult = {
  downPaymentUf: number;
  balanceUf: number;
  installmentUf: number;
  downPaymentClp: number;
  balanceClp: number;
  installmentClp: number;
};

export function simulate({ priceUf, downPaymentPct, months, monthlyRate, ufValue }: SimulationInput): SimulationResult {
  if (!(priceUf > 0)) throw new RangeError("priceUf debe ser mayor que 0");
  if (!(downPaymentPct >= 0 && downPaymentPct <= 1)) throw new RangeError("downPaymentPct debe estar entre 0 y 1");
  if (!Number.isInteger(months) || months <= 0) throw new RangeError("months debe ser un entero positivo");
  if (!(monthlyRate >= 0)) throw new RangeError("monthlyRate no puede ser negativa");
  if (!(ufValue > 0)) throw new RangeError("ufValue debe ser mayor que 0");

  const downPaymentUf = priceUf * downPaymentPct;
  const balanceUf = priceUf - downPaymentUf;
  const installmentUf =
    monthlyRate === 0 ? balanceUf / months : (balanceUf * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  return {
    downPaymentUf,
    balanceUf,
    installmentUf,
    downPaymentClp: Math.round(downPaymentUf * ufValue),
    balanceClp: Math.round(balanceUf * ufValue),
    installmentClp: Math.round(installmentUf * ufValue),
  };
}
```

- [ ] **Step 4: Confirmar que pasan**

Run: `npm test`
Expected: PASS en `format.test.ts` y `credit.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib
git commit -m "feat: add currency formatting and credit simulation"
```

---

### Task 3: Datos del sitio, lotes y enlaces de WhatsApp

**Files:**
- Create: `src/data/site.ts`, `src/data/lots.ts`, `src/data/credit.ts`, `src/data/pillars.ts`, `src/lib/lots.ts`, `src/lib/whatsapp.ts`
- Test: `src/lib/lots.test.ts`, `src/lib/whatsapp.test.ts`

**Interfaces:**
- Consumes: `formatUf`, `formatPercent` de `@/lib/format`.
- Produces:
  - `site` y `navLinks: readonly { href: string; label: string; longLabel: string }[]` de `@/data/site`
  - `type LotCategory = "panoramica" | "plana"`, `type Lot = { id: string; name: string; priceUf: number; category: LotCategory; badge: { label: string; tone: "available" | "last" }; description: string; image: string }`, `lots: readonly Lot[]`, `type LotFilter = "todas" | LotCategory`, `lotFilters: readonly { value: LotFilter; label: string }[]` de `@/data/lots`
  - `creditConfig: { downPaymentOptions: readonly number[]; termOptions: readonly number[]; monthlyRate: number; defaultDownPayment: number; defaultTerm: number; fallbackUfValue: number }` de `@/data/credit`
  - `pillars: readonly { icon: LucideIcon; title: string; description: string; tag: string }[]`, `heroStats: readonly { label: string; value: string }[]`, `travelTimes: readonly { time: string; label: string }[]` de `@/data/pillars`
  - `findLot(id: string): Lot | undefined`, `filterLots(items: readonly Lot[], filter: LotFilter): Lot[]`, `minPriceUf(items: readonly Lot[]): number` de `@/lib/lots`
  - `buildWhatsAppUrl(message: string): string`, `generalMessage: string`, `visitMessage: string`, `simulationMessage(input: { lotName: string; priceUf: number; downPaymentPct: number; downPaymentUf: number; months: number; installmentUf: number }): string`, `visitRequestMessage(input: { name: string; phone: string; date?: string }): string` de `@/lib/whatsapp`

- [ ] **Step 1: Crear los datos**

`src/data/site.ts`:

```ts
export const site = {
  name: "TERRAVÍDA",
  tagline: "Parcelas & Naturaleza",
  project: "Refugio El Convento",
  location: "Santo Domingo",
  whatsappNumber: "56933722243",
  phones: ["+56 9 3372 2243", "+56 9 3377 3996"],
  instagram: {
    handle: "@terravida.parcelas",
    url: "https://www.instagram.com/terravida.parcelas/",
  },
  mapsUrl: "https://maps.google.com/?q=El+Convento+Santo+Domingo+Chile",
  visitSchedule: "Atención de miércoles a domingo en Refugio El Convento.",
} as const;

export const navLinks = [
  { href: "#pilares", label: "Pilares", longLabel: "Pilares del proyecto" },
  { href: "#catalogo", label: "Lotes", longLabel: "Catálogo de lotes" },
  { href: "#simulador", label: "Simulador", longLabel: "Simulador de crédito" },
  { href: "#ubicacion", label: "Ubicación", longLabel: "Ubicación y rutas" },
] as const;
```

`src/data/lots.ts`:

```ts
export type LotCategory = "panoramica" | "plana";
export type LotFilter = "todas" | LotCategory;

export type Lot = {
  id: string;
  name: string;
  /** Precio en UF. Única fuente de verdad: los pesos siempre se derivan de la UF. */
  priceUf: number;
  category: LotCategory;
  badge: { label: string; tone: "available" | "last" };
  description: string;
  image: string;
};

export const lots: readonly Lot[] = [
  {
    id: "convento-a-04",
    name: "Lote Convento A-04",
    priceUf: 1100,
    category: "panoramica",
    badge: { label: "Disponible", tone: "available" },
    description: "Lomaje suave con vista al valle. 5.000 m² con luz soterrada y Rol Propio.",
    image: "/images/parcela_post_1.jpg",
  },
  {
    id: "mirador-b-09",
    name: "Lote Mirador B-09",
    priceUf: 1450,
    category: "panoramica",
    badge: { label: "Disponible", tone: "available" },
    description: "Cota alta con vista al mar a lo lejos. 5.000 m² y luz soterrada.",
    // Foto provisional de Unsplash: reemplazar por una foto propia del lote.
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pradera-c-12",
    name: "Lote Pradera C-12",
    priceUf: 1350,
    category: "plana",
    badge: { label: "Última plana", tone: "last" },
    description: "Topografía 100% plana para construir de inmediato. 5.000 m².",
    // Foto provisional de Unsplash: reemplazar por una foto propia del lote.
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
  },
];

export const lotFilters: readonly { value: LotFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "panoramica", label: "Vista al mar / Lomaje" },
  { value: "plana", label: "Planas" },
];
```

`src/data/credit.ts`:

```ts
export type CreditConfig = {
  /** Fracciones del precio ofrecidas como pie. */
  downPaymentOptions: readonly number[];
  /** Plazos en meses. */
  termOptions: readonly number[];
  /** Tasa mensual como fracción. 0 = sin interés. */
  monthlyRate: number;
  defaultDownPayment: number;
  defaultTerm: number;
  /** Valor de la UF usado cuando la API no responde. Actualizar de vez en cuando. */
  fallbackUfValue: number;
};

export const creditConfig: CreditConfig = {
  downPaymentOptions: [0.3, 0.5],
  termOptions: [12, 24, 36, 48],
  monthlyRate: 0,
  defaultDownPayment: 0.5,
  defaultTerm: 48,
  fallbackUfValue: 41136,
};
```

`src/data/pillars.ts`:

```ts
import { BadgeCheck, Banknote, Trees, Zap, type LucideIcon } from "lucide-react";

export const heroStats: readonly { label: string; value: string }[] = [
  { label: "Superficie", value: "5.000 m²" },
  { label: "Estatus", value: "Rol Propio" },
  { label: "Red", value: "Soterrada" },
  { label: "Crédito", value: "48 cuotas" },
];

export const pillars: readonly { icon: LucideIcon; title: string; description: string; tag: string }[] = [
  {
    icon: Zap,
    title: "Luz Soterrada",
    description: "Red 100% subterránea. Vista panorámica limpia, sin postes ni cables aéreos.",
    tag: "Norma SEC",
  },
  {
    icon: BadgeCheck,
    title: "Rol Propio Individual",
    description: "Subdivisión aprobada (SAG / CBR). Escrituración notarial inmediata.",
    tag: "D.L. 3.516",
  },
  {
    icon: Banknote,
    title: "Crédito Directo",
    description: "Hasta 48 cuotas directas con la inmobiliaria, sin bancos.",
    tag: "Trato directo",
  },
  {
    icon: Trees,
    title: "Mar & Naturaleza",
    description: "Entorno protegido, brisa marina y cercanía a la Reserva Nacional El Yali.",
    tag: "Santo Domingo",
  },
];

export const travelTimes: readonly { time: string; label: string }[] = [
  { time: "20 minutos", label: "Santo Domingo & Golf" },
  { time: "15 minutos", label: "Reserva El Yali & Playas" },
  { time: "90 minutos", label: "Santiago (Ruta 78)" },
];
```

- [ ] **Step 2: Escribir los tests**

`src/lib/lots.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { lots } from "@/data/lots";
import { filterLots, findLot, minPriceUf } from "./lots";

describe("findLot", () => {
  it("encuentra un lote por id", () => {
    expect(findLot("mirador-b-09")?.name).toBe("Lote Mirador B-09");
  });
  it("devuelve undefined para un id desconocido", () => {
    expect(findLot("no-existe")).toBeUndefined();
  });
});

describe("filterLots", () => {
  it("devuelve todos con el filtro 'todas'", () => {
    expect(filterLots(lots, "todas")).toHaveLength(lots.length);
  });
  it("filtra por categoría", () => {
    expect(filterLots(lots, "plana").map((lot) => lot.id)).toEqual(["pradera-c-12"]);
  });
  it("devuelve una lista vacía si ningún lote coincide", () => {
    const onlyPanoramic = lots.filter((lot) => lot.category === "panoramica");
    expect(filterLots(onlyPanoramic, "plana")).toEqual([]);
  });
});

describe("minPriceUf", () => {
  it("devuelve el precio más bajo", () => {
    expect(minPriceUf(lots)).toBe(1100);
  });
});
```

`src/lib/whatsapp.test.ts`:

```ts
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
```

- [ ] **Step 3: Confirmar que fallan**

Run: `npm test`
Expected: FAIL, no se pueden resolver `./lots` ni `./whatsapp`.

- [ ] **Step 4: Implementar**

`src/lib/lots.ts`:

```ts
import { lots, type Lot, type LotFilter } from "@/data/lots";

export function findLot(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

export function filterLots(items: readonly Lot[], filter: LotFilter): Lot[] {
  return filter === "todas" ? [...items] : items.filter((lot) => lot.category === filter);
}

export function minPriceUf(items: readonly Lot[]): number {
  return Math.min(...items.map((lot) => lot.priceUf));
}
```

`src/lib/whatsapp.ts`:

```ts
import { site } from "@/data/site";
import { formatPercent, formatUf } from "@/lib/format";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const generalMessage = "Hola Terravida, deseo información sobre las parcelas.";
export const visitMessage = "Hola, quiero coordinar una visita a Terravida.";

export function simulationMessage(input: {
  lotName: string;
  priceUf: number;
  downPaymentPct: number;
  downPaymentUf: number;
  months: number;
  installmentUf: number;
}): string {
  return [
    `Hola! Vengo de la web y coticé *${input.lotName}* (${formatUf(input.priceUf)}):`,
    `• Pie: ${formatPercent(input.downPaymentPct)} (${formatUf(input.downPaymentUf)})`,
    `• Plazo: ${input.months} cuotas de ~${formatUf(input.installmentUf, 2)}`,
    "Quiero confirmar disponibilidad y coordinar visita.",
  ].join("\n");
}

export function visitRequestMessage(input: { name: string; phone: string; date?: string }): string {
  const [year, month, day] = (input.date ?? "").split("-");
  const date = year && month && day ? `${day}/${month}/${year}` : "Por coordinar";
  return [
    "*Solicitud de Visita Web*",
    `• Nombre: ${input.name}`,
    `• Tel: ${input.phone}`,
    `• Fecha: ${date}`,
    "Favor coordinar visita a Refugio El Convento.",
  ].join("\n");
}
```

- [ ] **Step 5: Confirmar que pasan**

Run: `npm test && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data src/lib
git commit -m "feat: add site content, lots data and WhatsApp link builders"
```

---

### Task 4: UF del día con respaldo

**Files:**
- Create: `src/lib/uf.ts`
- Test: `src/lib/uf.test.ts`

**Interfaces:**
- Consumes: `creditConfig.fallbackUfValue` de `@/data/credit`.
- Produces: `type UfQuote = { value: number; date: string | null; isFallback: boolean }`, `getUf(): Promise<UfQuote>`. Nunca rechaza.

La API responde `{ "serie": [{ "fecha": "2026-10-10T03:00:00.000Z", "valor": 41136.24 }, ...] }`; el primer elemento es el más reciente.

- [ ] **Step 1: Escribir los tests**

`src/lib/uf.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("devuelve el valor más reciente de la serie", async () => {
    const fetchMock = mockFetch(
      jsonResponse({
        serie: [
          { fecha: "2026-10-10T03:00:00.000Z", valor: 41136.24 },
          { fecha: "2026-10-09T03:00:00.000Z", valor: 41130.94 },
        ],
      }),
    );
    expect(await getUf()).toEqual({ value: 41136.24, date: "2026-10-10T03:00:00.000Z", isFallback: false });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://mindicador.cl/api/uf",
      expect.objectContaining({ next: { revalidate: 86400 } }),
    );
  });

  it("usa el respaldo si la red falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await getUf()).toEqual(fallback);
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
```

- [ ] **Step 2: Confirmar que fallan**

Run: `npm test -- src/lib/uf.test.ts`
Expected: FAIL, no se puede resolver `./uf`.

- [ ] **Step 3: Implementar**

`src/lib/uf.ts`:

```ts
import { creditConfig } from "@/data/credit";

export type UfQuote = {
  value: number;
  /** Fecha ISO del valor, o null cuando se usa el respaldo. */
  date: string | null;
  isFallback: boolean;
};

const UF_ENDPOINT = "https://mindicador.cl/api/uf";
const ONE_DAY_SECONDS = 86400;
// Rango de cordura: descarta respuestas corruptas sin atarse a un valor exacto.
const MIN_PLAUSIBLE_UF = 10_000;
const MAX_PLAUSIBLE_UF = 500_000;

export async function getUf(): Promise<UfQuote> {
  try {
    const response = await fetch(UF_ENDPOINT, {
      next: { revalidate: ONE_DAY_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`mindicador.cl respondió ${response.status}`);

    const data = (await response.json()) as { serie?: { fecha?: unknown; valor?: unknown }[] } | null;
    const latest = data?.serie?.[0];
    const value = latest?.valor;
    const date = latest?.fecha;
    if (typeof value !== "number" || value < MIN_PLAUSIBLE_UF || value > MAX_PLAUSIBLE_UF || typeof date !== "string") {
      throw new Error("mindicador.cl devolvió un valor de UF no válido");
    }
    return { value, date, isFallback: false };
  } catch (error) {
    console.error("No se pudo obtener la UF; se usa el valor de respaldo.", error);
    return { value: creditConfig.fallbackUfValue, date: null, isFallback: true };
  }
}
```

- [ ] **Step 4: Confirmar que pasan**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/uf.ts src/lib/uf.test.ts
git commit -m "feat: fetch daily UF value with fallback"
```

---

### Task 5: Leads por correo

**Files:**
- Create: `src/lib/leads.ts`, `src/app/api/leads/route.ts`
- Test: `src/lib/leads.test.ts`, `src/app/api/leads/route.test.ts`

**Interfaces:**
- Produces:
  - `leadSchema` (Zod) y `type Lead = { name: string; phone: string; date?: string; website?: string }` de `@/lib/leads`
  - `buildLeadEmail(lead: Lead): { subject: string; html: string; text: string }`
  - `POST /api/leads` con cuerpo JSON `{ name, phone, date?, website? }`. Respuestas: `200 { ok: true }`, `400 { error: "invalid_json" | "invalid_lead" }`, `503 { error: "not_configured" }`, `502 { error: "send_failed" }`. `website` es el campo trampa: si viene con texto, responde 200 sin enviar.

- [ ] **Step 1: Escribir los tests**

`src/lib/leads.test.ts`:

```ts
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
```

`src/app/api/leads/route.test.ts`:

```ts
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
```

- [ ] **Step 2: Confirmar que fallan**

Run: `npm test`
Expected: FAIL, no se pueden resolver `./leads` ni `./route`.

- [ ] **Step 3: Implementar**

`src/lib/leads.ts`:

```ts
import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{8,20}$/),
  date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional(),
  /** Campo trampa: los humanos no lo ven, los bots lo rellenan. */
  website: z.string().max(200).optional(),
});

export type Lead = z.infer<typeof leadSchema>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildLeadEmail(lead: Lead): { subject: string; html: string; text: string } {
  const [year, month, day] = (lead.date ?? "").split("-");
  const date = year && month && day ? `${day}/${month}/${year}` : "Por coordinar";
  const rows: [string, string][] = [
    ["Nombre", lead.name],
    ["Teléfono", lead.phone],
    ["Fecha estimada", date],
  ];

  return {
    subject: `Nueva solicitud de visita — ${lead.name}`,
    text: [
      "Solicitud de visita desde la web de Terravida",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n"),
    html: [
      "<h2>Solicitud de visita desde la web de Terravida</h2>",
      "<table cellpadding=\"6\">",
      ...rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`),
      "</table>",
    ].join(""),
  };
}
```

`src/app/api/leads/route.ts`:

```ts
import { Resend } from "resend";
import { buildLeadEmail, leadSchema } from "@/lib/leads";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_lead" }, { status: 400 });
  }
  if (parsed.data.website) {
    return Response.json({ ok: true });
  }

  const { RESEND_API_KEY, LEADS_TO_EMAIL, LEADS_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !LEADS_TO_EMAIL || !LEADS_FROM_EMAIL) {
    console.error("Lead no enviado: faltan RESEND_API_KEY, LEADS_TO_EMAIL o LEADS_FROM_EMAIL.");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: LEADS_FROM_EMAIL,
      to: LEADS_TO_EMAIL,
      ...buildLeadEmail(parsed.data),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Lead no enviado: el proveedor de correo falló.", error);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
```

- [ ] **Step 4: Confirmar que pasan**

Run: `npm test && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/leads.ts src/lib/leads.test.ts src/app/api
git commit -m "feat: add lead validation and email delivery endpoint"
```

---

### Task 6: Componentes base y layout

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/SectionHeading.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/Reveal.tsx`
- Create: `src/components/layout/BackgroundDecor.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/MobileMenu.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/WhatsAppFab.tsx`

**Interfaces:**
- Consumes: `site`, `navLinks` de `@/data/site`; `buildWhatsAppUrl`, `generalMessage` de `@/lib/whatsapp`.
- Produces:
  - `Button(props: ComponentProps<"button"> & { variant?: "gold" | "outline"; size?: "sm" | "md" })`
  - `ButtonLink(props: ComponentProps<"a"> & { variant?: "gold" | "outline"; size?: "sm" | "md" })`
  - `Card(props: ComponentProps<"div">)`
  - `SectionHeading({ eyebrow, title, align? }: { eyebrow: string; title: string; align?: "left" | "center" })`
  - `Chip(props: ComponentProps<"button"> & { selected: boolean })` (renderiza `aria-pressed`)
  - `Reveal({ children, className? }: { children: ReactNode; className?: string })`
  - `BackgroundDecor()`, `Header()`, `Footer()`, `WhatsAppFab()`
  - Los enlaces externos deben pasar `target="_blank"` y `rel="noopener noreferrer"`.

Estos componentes no llevan tests unitarios (el spec define verificación manual para la interfaz); se verifican con lint, build y revisión visual en Task 10.

- [ ] **Step 1: Componentes `ui`**

`src/components/ui/Button.tsx`:

```tsx
import type { ComponentProps } from "react";

type Variant = "gold" | "outline";
type Size = "sm" | "md";
type StyleProps = { variant?: Variant; size?: Size };

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const variants: Record<Variant, string> = {
  gold: "gold-btn shadow-gold-glow",
  outline: "border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10",
};
const sizes: Record<Size, string> = {
  sm: "rounded-full px-4 text-xs",
  md: "rounded-xl px-6 py-3 text-sm",
};

function classes({ variant = "gold", size = "md" }: StyleProps, className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={classes({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<"a"> & StyleProps) {
  return <a className={classes({ variant, size }, className)} {...props} />;
}
```

`src/components/ui/Card.tsx`:

```tsx
import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`reticle-corner rounded-2xl border border-brand-gold/25 bg-brand-card shadow-dark-card transition-colors hover:border-brand-gold/50 ${className}`}
      {...props}
    />
  );
}
```

`src/components/ui/SectionHeading.tsx`:

```tsx
type Props = { eyebrow: string; title: string; align?: "left" | "center" };

export function SectionHeading({ eyebrow, title, align = "center" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-xl text-center" : ""}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">{eyebrow}</p>
      <h2 className="font-serif text-3xl text-brand-ivory sm:text-4xl lg:text-[2.75rem] lg:leading-tight">{title}</h2>
    </div>
  );
}
```

`src/components/ui/Chip.tsx`:

```tsx
import type { ComponentProps } from "react";

type Props = ComponentProps<"button"> & { selected: boolean };

export function Chip({ selected, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
        selected ? "gold-btn" : "border border-brand-gold/25 text-brand-linen hover:border-brand-gold hover:text-white"
      } ${className}`}
      {...props}
    />
  );
}
```

`src/components/ui/Reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Fondo decorativo**

`src/components/layout/BackgroundDecor.tsx`:

```tsx
export function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[100px] sm:h-[450px] sm:w-[650px] lg:w-[800px] lg:blur-[140px]" />
      <div className="absolute -right-20 top-1/3 h-[350px] w-[280px] rounded-full bg-brand-olive/10 blur-[100px] sm:h-[550px] sm:w-[450px] lg:blur-[140px]" />
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
        <path d="M-100 180 C 250 120, 450 280, 850 160 C 1150 70, 1350 240, 1600 180" stroke="#CBB07E" strokeOpacity="0.25" strokeDasharray="6 8" />
        <path d="M-100 240 C 220 180, 480 340, 880 220 C 1180 130, 1380 300, 1600 240" stroke="#CBB07E" strokeWidth="1.2" strokeOpacity="0.3" />
        <path d="M-100 300 C 190 240, 510 400, 910 280 C 1210 190, 1410 360, 1600 300" stroke="#CBB07E" strokeOpacity="0.2" />
        <path d="M-100 380 C 160 320, 540 470, 940 350 C 1240 260, 1440 430, 1600 370" stroke="#CBB07E" strokeWidth="1.2" strokeOpacity="0.35" />
        <path d="M-100 460 C 130 400, 570 540, 970 420 C 1270 330, 1470 500, 1600 440" stroke="#CBB07E" strokeOpacity="0.2" />
        <path d="M-100 760 C 280 680, 620 860, 1030 720 C 1330 620, 1520 800, 1600 740" stroke="#CBB07E" strokeWidth="1.5" strokeOpacity="0.35" />
        <text x="320" y="225" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">COTA +142.5m</text>
        <text x="960" y="335" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">COTA +168.0m</text>
        <text x="580" y="750" fill="#CBB07E" fillOpacity="0.4" fontSize="9" fontFamily="monospace" letterSpacing="2">DESLINDE SUR · EL CONVENTO</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Header y menú móvil**

`src/components/layout/MobileMenu.tsx`:

```tsx
"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks, site } from "@/data/site";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

type Props = { open: boolean; activeId: string | null; onNavigate: () => void };

export function MobileMenu({ open, activeId, onNavigate }: Props) {
  if (!open) return null;

  return (
    <div id="mobile-menu" className="border-b border-brand-gold/25 bg-brand-surface px-5 py-5 md:hidden">
      <nav aria-label="Menú móvil" className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={activeId === link.href.slice(1) ? "location" : undefined}
            className="flex min-h-12 items-center justify-between border-b border-brand-border text-sm font-bold uppercase tracking-[0.18em] text-brand-ivory hover:text-brand-gold aria-[current]:text-brand-gold"
          >
            {link.longLabel}
            <ChevronRight aria-hidden="true" className="size-4 text-brand-gold" />
          </a>
        ))}
        <div className="flex flex-col gap-3 pt-4">
          <ButtonLink href="#contacto-visita" onClick={onNavigate}>
            Agendar visita a terreno
          </ButtonLink>
          <ButtonLink
            variant="outline"
            href={buildWhatsAppUrl(generalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            WhatsApp ({site.phones[0]})
          </ButtonLink>
        </div>
      </nav>
    </div>
  );
}
```

`src/components/layout/Header.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks, site } from "@/data/site";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

const sectionIds = navLinks.map((link) => link.href.slice(1));

function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useActiveSection(sectionIds);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gold/15 bg-brand-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <a href="#inicio" className="group flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-gold/40 bg-black p-0.5 sm:size-11">
            <Image src="/images/logo.png" alt="" width={44} height={44} />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-base font-bold tracking-[0.18em] text-brand-ivory transition-colors group-hover:text-brand-gold sm:text-lg lg:text-xl">
              {site.name}
            </span>
            <span className="text-[9px] uppercase leading-none tracking-[0.25em] text-brand-gold">{site.tagline}</span>
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeId === link.href.slice(1) ? "location" : undefined}
              className="border-b border-transparent py-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-linen transition-colors hover:text-brand-gold aria-[current]:border-brand-gold aria-[current]:text-brand-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <ButtonLink
            variant="outline"
            size="sm"
            href={buildWhatsAppUrl(generalMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            WhatsApp
          </ButtonLink>
          <ButtonLink size="sm" href="#contacto-visita">
            Agendar visita
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-lg text-brand-gold hover:text-white md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>

      <MobileMenu open={menuOpen} activeId={activeId} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}
```

- [ ] **Step 4: Footer y botón flotante**

`src/components/layout/Footer.tsx`:

```tsx
import Image from "next/image";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-brand-gold/15 bg-brand-black py-10 text-sm text-brand-muted">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="" width={32} height={32} />
          <span className="font-display font-bold tracking-[0.2em] text-white">{site.name}</span>
        </div>
        <p>
          {site.phones.join(" · ")}
          <span aria-hidden="true" className="mx-2">|</span>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
            {site.instagram.handle}
          </a>
        </p>
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}, Chile
        </p>
      </div>
    </footer>
  );
}
```

`src/components/layout/WhatsAppFab.tsx`:

```tsx
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={buildWhatsAppUrl(generalMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="gold-btn fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full shadow-gold-glow sm:bottom-6 sm:right-6"
    >
      <MessageCircle aria-hidden="true" className="size-6" />
    </a>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npm run lint && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/components
git commit -m "feat: add UI primitives and layout components"
```

---

### Task 7: Secciones estáticas (Hero, Pilares, Ubicación)

**Files:**
- Create: `src/components/sections/Hero.tsx`, `src/components/sections/Pillars.tsx`, `src/components/sections/Location.tsx`

**Interfaces:**
- Consumes: `ButtonLink`, `Card`, `SectionHeading`, `Reveal`; `heroStats`, `pillars`, `travelTimes` de `@/data/pillars`; `site` de `@/data/site`; `creditConfig` de `@/data/credit`; `lots` de `@/data/lots`; `minPriceUf` de `@/lib/lots`; `formatUf`, `formatClp`, `formatPercent` de `@/lib/format`; `buildWhatsAppUrl`, `visitMessage` de `@/lib/whatsapp`.
- Produces: `Hero({ ufValue }: { ufValue: number })`, `Pillars()`, `Location()`. Ids de sección: `inicio`, `pilares`, `ubicacion`.

- [ ] **Step 1: Hero**

`src/components/sections/Hero.tsx`:

```tsx
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { creditConfig } from "@/data/credit";
import { lots } from "@/data/lots";
import { heroStats } from "@/data/pillars";
import { site } from "@/data/site";
import { formatClp, formatPercent, formatUf } from "@/lib/format";
import { minPriceUf } from "@/lib/lots";
import { buildWhatsAppUrl, visitMessage } from "@/lib/whatsapp";

export function Hero({ ufValue }: { ufValue: number }) {
  const fromPriceUf = minPriceUf(lots);
  const minDownPayment = Math.min(...creditConfig.downPaymentOptions);
  const maxTerm = Math.max(...creditConfig.termOptions);

  return (
    <section id="inicio" className="border-b border-brand-gold/15 pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="flex flex-col items-start">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/35 bg-brand-surface px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-gold motion-safe:animate-pulse" />
            {site.project} · {site.location}
          </p>

          <h1 className="hero-title mb-5 font-serif tracking-tight text-brand-ivory">
            Tu terreno, tu proyecto, <span className="gold-gradient-text italic">tu decisión.</span>
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-brand-linen lg:text-lg">
            Parcelas de 5.000 m² con Rol Propio individual, red de luz 100% subterránea y crédito directo en hasta{" "}
            {maxTerm} cuotas.
          </p>

          <dl className="mb-8 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="reticle-corner rounded-xl border border-brand-gold/25 bg-brand-surface/90 p-3 text-center"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">{stat.label}</dt>
                <dd className="mt-1 font-serif text-lg font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="#catalogo">Ver parcelas disponibles</ButtonLink>
            <ButtonLink
              variant="outline"
              href={buildWhatsAppUrl(visitMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              WhatsApp
            </ButtonLink>
          </div>
        </div>

        <div className="group relative mx-auto w-full max-w-[540px] overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-surface shadow-gold-glow lg:max-w-none">
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/parcela_post_1.jpg"
              alt="Vista de una parcela de Terravida en Refugio El Convento"
              fill
              preload
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
          </div>
          <div className="glass-card absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl p-4 sm:inset-x-4 sm:bottom-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Preventa Etapa 1</p>
              <p className="font-serif text-2xl font-bold leading-tight text-brand-ivory">Desde {formatUf(fromPriceUf)}</p>
              <p className="text-sm text-brand-linen">~{formatClp(fromPriceUf * ufValue)} CLP</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-brand-gold">Pie desde {formatPercent(minDownPayment)}</p>
              <p className="text-xs text-white/80">Hasta {maxTerm} cuotas en UF</p>
              <a
                href="#simulador"
                className="mt-1 inline-block py-1 text-xs font-bold uppercase tracking-wider text-brand-gold-light underline"
              >
                Simular cuota →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Nota: en Next.js 16 la prop de `next/image` para precargar la imagen principal es `preload`. Si TypeScript la rechaza en la versión instalada, usar `priority`.

- [ ] **Step 2: Pilares**

`src/components/sections/Pillars.tsx`:

```tsx
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pillars } from "@/data/pillars";

export function Pillars() {
  return (
    <section id="pilares" className="border-b border-brand-gold/15 bg-brand-surface/50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Certeza & Entorno" title="Pilares del Proyecto" />
        <Reveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description, tag }) => (
            <Card key={title} className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/15 text-brand-gold">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-brand-ivory">{title}</h3>
                <p className="text-sm leading-relaxed text-brand-linen">{description}</p>
              </div>
              <p className="mt-5 border-t border-brand-gold/15 pt-3 text-xs font-semibold uppercase tracking-wider text-brand-gold">
                {tag}
              </p>
            </Card>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Ubicación**

`src/components/sections/Location.tsx`:

```tsx
import { Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { travelTimes } from "@/data/pillars";
import { site } from "@/data/site";

export function Location() {
  return (
    <section id="ubicacion" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 text-center sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Ubicación" title={`${site.project} · ${site.location}`} />
        <Reveal className="mb-8 mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {travelTimes.map((item) => (
            <Card key={item.label} className="p-5">
              <p className="mb-1 font-serif text-2xl font-bold text-brand-gold">{item.time}</p>
              <p className="text-sm uppercase tracking-wider text-brand-linen">{item.label}</p>
            </Card>
          ))}
        </Reveal>
        <a
          href={site.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gold hover:underline"
        >
          <Navigation aria-hidden="true" className="size-4" />
          Abrir ubicación en Google Maps →
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npm run lint && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections
git commit -m "feat: add hero, pillars and location sections"
```

---

### Task 8: Selección de lote, catálogo y simulador

**Files:**
- Create: `src/components/providers/LotSelectionProvider.tsx`, `src/components/sections/Catalog.tsx`, `src/components/sections/Simulator.tsx`

**Interfaces:**
- Consumes: `lots`, `lotFilters`, `Lot`, `LotFilter` de `@/data/lots`; `findLot`, `filterLots` de `@/lib/lots`; `creditConfig` de `@/data/credit`; `simulate` de `@/lib/credit`; `UfQuote` de `@/lib/uf`; `formatUf`, `formatClp`, `formatPercent`, `formatDate` de `@/lib/format`; `buildWhatsAppUrl`, `simulationMessage` de `@/lib/whatsapp`; `Button`, `ButtonLink`, `Card`, `Chip`, `Reveal`, `SectionHeading`.
- Produces:
  - `LotSelectionProvider({ children }: { children: ReactNode })`
  - `useLotSelection(): { selectedLot: Lot; selectLot: (id: string) => void }` (un id desconocido no cambia la selección)
  - `Catalog({ ufValue }: { ufValue: number })`, `Simulator({ uf }: { uf: UfQuote })`. Ids de sección: `catalogo`, `simulador`.

- [ ] **Step 1: Provider**

`src/components/providers/LotSelectionProvider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { lots, type Lot } from "@/data/lots";
import { findLot } from "@/lib/lots";

type LotSelection = { selectedLot: Lot; selectLot: (id: string) => void };

const LotSelectionContext = createContext<LotSelection | null>(null);

export function LotSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedLot, setSelectedLot] = useState<Lot>(lots[0]);

  const selectLot = useCallback((id: string) => {
    const lot = findLot(id);
    if (lot) setSelectedLot(lot);
  }, []);

  const value = useMemo(() => ({ selectedLot, selectLot }), [selectedLot, selectLot]);

  return <LotSelectionContext.Provider value={value}>{children}</LotSelectionContext.Provider>;
}

export function useLotSelection(): LotSelection {
  const context = useContext(LotSelectionContext);
  if (!context) throw new Error("useLotSelection debe usarse dentro de LotSelectionProvider");
  return context;
}
```

- [ ] **Step 2: Catálogo**

`src/components/sections/Catalog.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { lotFilters, lots, type Lot, type LotFilter } from "@/data/lots";
import { formatClp, formatUf } from "@/lib/format";
import { filterLots } from "@/lib/lots";

const badgeTones: Record<Lot["badge"]["tone"], string> = {
  available: "bg-emerald-700",
  last: "bg-amber-700",
};

export function Catalog({ ufValue }: { ufValue: number }) {
  const [filter, setFilter] = useState<LotFilter>("todas");
  const { selectLot } = useLotSelection();
  const visibleLots = filterLots(lots, filter);

  function handleSimulate(id: string) {
    selectLot(id);
    document.getElementById("simulador")?.scrollIntoView();
  }

  return (
    <section id="catalogo" className="border-b border-brand-gold/15 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Disponibilidad" title="Catálogo de Parcelas" align="left" />
          <div
            role="group"
            aria-label="Filtrar parcelas"
            className="flex max-w-full gap-1.5 overflow-x-auto rounded-2xl border border-brand-gold/25 bg-brand-surface p-1.5"
          >
            {lotFilters.map((option) => (
              <Chip key={option.value} selected={filter === option.value} onClick={() => setFilter(option.value)}>
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        {visibleLots.length === 0 ? (
          <p className="rounded-2xl border border-brand-gold/25 bg-brand-card p-8 text-center text-brand-linen">
            No hay parcelas disponibles en esta categoría por ahora.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleLots.map((lot) => (
              <li key={lot.id} className="flex">
                <Card className="flex w-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={lot.image}
                      alt={`Vista del ${lot.name}`}
                      fill
                      sizes="(min-width: 768px) 380px, 100vw"
                      className="object-cover"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-bold uppercase text-white ${badgeTones[lot.badge.tone]}`}
                    >
                      {lot.badge.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-xl font-bold text-brand-ivory">{lot.name}</h3>
                      <p className="whitespace-nowrap font-serif text-lg font-bold text-brand-gold">
                        {formatUf(lot.priceUf)}
                      </p>
                    </div>
                    <p className="mb-4 flex-1 text-sm text-brand-linen">{lot.description}</p>
                    <p className="mb-4 flex justify-between border-t border-brand-gold/15 pt-3 text-sm text-brand-muted">
                      Valor referencial:
                      <strong className="text-brand-ivory">~{formatClp(lot.priceUf * ufValue)} CLP</strong>
                    </p>
                    <Button className="w-full" onClick={() => handleSimulate(lot.id)}>
                      Simular cuotas
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Simulador**

`src/components/sections/Simulator.tsx`:

```tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLotSelection } from "@/components/providers/LotSelectionProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { creditConfig } from "@/data/credit";
import { simulate } from "@/lib/credit";
import { formatClp, formatDate, formatPercent, formatUf } from "@/lib/format";
import type { UfQuote } from "@/lib/uf";
import { buildWhatsAppUrl, simulationMessage } from "@/lib/whatsapp";

export function Simulator({ uf }: { uf: UfQuote }) {
  const { selectedLot } = useLotSelection();
  const [downPaymentPct, setDownPaymentPct] = useState(creditConfig.defaultDownPayment);
  const [months, setMonths] = useState(creditConfig.defaultTerm);

  const result = simulate({
    priceUf: selectedLot.priceUf,
    downPaymentPct,
    months,
    monthlyRate: creditConfig.monthlyRate,
    ufValue: uf.value,
  });

  const whatsappUrl = buildWhatsAppUrl(
    simulationMessage({
      lotName: selectedLot.name,
      priceUf: selectedLot.priceUf,
      downPaymentPct,
      downPaymentUf: result.downPaymentUf,
      months,
      installmentUf: result.installmentUf,
    }),
  );

  const ufNote = uf.isFallback || !uf.date
    ? `UF a valor de referencia (${formatClp(uf.value)}).`
    : `UF del ${formatDate(uf.date)}: ${formatClp(uf.value)}.`;
  const rateNote =
    creditConfig.monthlyRate === 0
      ? "Sin interés"
      : `Tasa ${(creditConfig.monthlyRate * 100).toLocaleString("es-CL")}% mensual`;

  return (
    <section id="simulador" className="border-b border-brand-gold/15 bg-brand-surface/60 py-16 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Sin bancos" title="Simulador de Crédito Directo" />

        <div className="reticle-corner mt-10 rounded-3xl border border-brand-gold/35 bg-brand-card p-5 shadow-gold-glow sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-brand-gold/15 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-muted">Lote en simulación</p>
              <p className="font-serif text-xl font-bold text-brand-ivory">{selectedLot.name}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-bold text-brand-gold">{formatUf(selectedLot.priceUf)}</p>
              <p className="text-sm text-brand-linen">~{formatClp(selectedLot.priceUf * uf.value)} CLP</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">Pie inicial</legend>
              <div className="grid grid-cols-2 gap-2">
                {creditConfig.downPaymentOptions.map((option) => (
                  <Chip key={option} selected={downPaymentPct === option} onClick={() => setDownPaymentPct(option)}>
                    {formatPercent(option)} pie
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-linen">
                Plazo en cuotas
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {creditConfig.termOptions.map((option) => (
                  <Chip
                    key={option}
                    selected={months === option}
                    onClick={() => setMonths(option)}
                    aria-label={`${option} cuotas`}
                    className="px-0"
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <div aria-live="polite" className="mb-4 rounded-2xl border border-brand-gold/20 bg-brand-surface p-5">
            <dl className="space-y-2 text-sm text-brand-linen">
              <div className="flex items-center justify-between gap-4">
                <dt>Pie inicial a pagar:</dt>
                <dd className="font-serif text-base font-bold text-brand-gold">
                  {formatUf(result.downPaymentUf)} (~{formatClp(result.downPaymentClp)})
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Saldo en cuotas directas:</dt>
                <dd className="font-bold text-white">{formatUf(result.balanceUf)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-brand-gold/15 pt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Cuota mensual fija en UF</p>
                <p className="text-xs text-brand-muted">
                  {rateNote} · {months} cuotas
                </p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl font-bold text-brand-gold sm:text-3xl">
                  {formatUf(result.installmentUf, 2)} / mes
                </p>
                <p className="text-sm font-medium text-brand-ivory">~{formatClp(result.installmentClp)} CLP</p>
              </div>
            </div>
          </div>

          <p className="mb-5 text-xs leading-relaxed text-brand-muted">
            {ufNote} Los montos en pesos son una referencia a esa fecha: la cuota es fija en UF y su valor en pesos
            varía con la UF. Simulación referencial que no constituye oferta ni aprobación de crédito; las condiciones
            finales se formalizan con la inmobiliaria.
          </p>

          <ButtonLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <MessageCircle aria-hidden="true" className="size-5" />
            Solicitar esta simulación por WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: sin errores; todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: add lot catalog and credit simulator"
```

---

### Task 9: Formulario de visita

**Files:**
- Create: `src/components/sections/VisitForm.tsx`

**Interfaces:**
- Consumes: `Button`, `SectionHeading`; `site` de `@/data/site`; `buildWhatsAppUrl`, `visitRequestMessage` de `@/lib/whatsapp`; `POST /api/leads` (cuerpo `{ name, phone, date, website }`).
- Produces: `VisitForm()`. Id de sección: `contacto-visita`.

Comportamiento obligatorio: WhatsApp se abre de forma síncrona dentro del manejador del `submit` (si se abre después de un `await`, el navegador lo bloquea como ventana emergente). El `POST` va en paralelo y su fallo nunca afecta al usuario.

- [ ] **Step 1: Implementar**

`src/components/sections/VisitForm.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";
import { buildWhatsAppUrl, visitRequestMessage } from "@/lib/whatsapp";

const inputClasses =
  "min-h-12 w-full rounded-xl border border-brand-gold/25 bg-brand-surface px-4 text-base text-brand-ivory placeholder:text-brand-muted focus:border-brand-gold focus:outline-none";
const labelClasses = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-brand-linen";

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function VisitForm() {
  const [sent, setSent] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  // La fecha mínima depende del reloj del visitante, así que se fija en el cliente.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIso();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const lead = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      date: String(form.get("date") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    window.open(buildWhatsAppUrl(visitRequestMessage(lead)), "_blank", "noopener,noreferrer");

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      keepalive: true,
    }).catch((error) => console.error("No se pudo registrar el lead por correo.", error));

    setSent(true);
  }

  return (
    <section id="contacto-visita" className="bg-brand-surface/50 py-16 lg:py-24">
      <div className="mx-auto max-w-[580px] px-4 sm:px-6">
        <SectionHeading eyebrow="Terreno" title="Agenda tu Visita Guiada" />
        <p className="mt-3 text-center text-sm text-brand-linen">{site.visitSchedule}</p>

        <form
          onSubmit={handleSubmit}
          className="reticle-corner mt-8 space-y-5 rounded-3xl border border-brand-gold/30 bg-brand-card p-6 shadow-dark-card sm:p-8"
        >
          <div>
            <label htmlFor="visit-name" className={labelClasses}>
              Nombre completo
            </label>
            <input
              id="visit-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder="Tu nombre"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="visit-phone" className={labelClasses}>
              Teléfono / WhatsApp
            </label>
            <input
              id="visit-phone"
              name="phone"
              type="tel"
              required
              pattern="\+?[\d\s\(\)\-]{8,20}"
              title="Ingresa un teléfono válido, por ejemplo +56 9 1234 5678"
              autoComplete="tel"
              placeholder="+56 9 ..."
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="visit-date" className={labelClasses}>
              Fecha estimada de visita <span className="normal-case text-brand-muted">(opcional)</span>
            </label>
            <input ref={dateRef} id="visit-date" name="date" type="date" className={inputClasses} />
          </div>

          <div aria-hidden="true" className="hidden">
            <label htmlFor="visit-website">No completar este campo</label>
            <input id="visit-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <Button type="submit" className="w-full">
            Confirmar visita vía WhatsApp →
          </Button>

          <p role="status" className="text-center text-sm text-brand-gold-light">
            {sent
              ? `Abrimos WhatsApp con tu solicitud. Si no se abrió, escríbenos al ${site.phones[0]}.`
              : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar**

Run: `npm run lint && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/VisitForm.tsx
git commit -m "feat: add visit request form with WhatsApp and email lead"
```

---

### Task 10: Composición de la página, documentación de Vercel y verificación final

**Files:**
- Modify: `src/app/page.tsx`
- Create: `docs/DEPLOY_VERCEL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `getUf` de `@/lib/uf`; `LotSelectionProvider`; `BackgroundDecor`, `Header`, `Footer`, `WhatsAppFab`; `Hero({ ufValue })`, `Pillars()`, `Catalog({ ufValue })`, `Simulator({ uf })`, `Location()`, `VisitForm()`.

- [ ] **Step 1: Componer la página**

Reemplazar `src/app/page.tsx`:

```tsx
import { BackgroundDecor } from "@/components/layout/BackgroundDecor";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { LotSelectionProvider } from "@/components/providers/LotSelectionProvider";
import { Catalog } from "@/components/sections/Catalog";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Pillars } from "@/components/sections/Pillars";
import { Simulator } from "@/components/sections/Simulator";
import { VisitForm } from "@/components/sections/VisitForm";
import { getUf } from "@/lib/uf";

// La página se regenera una vez al día para tomar la UF vigente.
export const revalidate = 86400;

export default async function Home() {
  const uf = await getUf();

  return (
    <LotSelectionProvider>
      <BackgroundDecor />
      <Header />
      <main>
        <Hero ufValue={uf.value} />
        <Pillars />
        <Catalog ufValue={uf.value} />
        <Simulator uf={uf} />
        <Location />
        <VisitForm />
      </main>
      <Footer />
      <WhatsAppFab />
    </LotSelectionProvider>
  );
}
```

- [ ] **Step 2: Documento de despliegue**

Crear `docs/DEPLOY_VERCEL.md`:

````markdown
# Despliegue de Terravida en Vercel

Guía paso a paso para publicar el sitio y dejar funcionando el envío de solicitudes de visita por correo.

## 1. Requisitos

- Cuenta en [GitHub](https://github.com), [Vercel](https://vercel.com) y [Resend](https://resend.com). Los planes gratuitos alcanzan para este sitio.
- Node.js 20.9 o superior para trabajar en local.
- Acceso al DNS del dominio (solo si se usará un dominio propio o un remitente propio).

## 2. Probar en local

```bash
npm install
cp .env.example .env.local   # completar los valores, ver sección 4
npm run dev                  # http://localhost:3000
```

Antes de publicar, confirmar que todo pasa:

```bash
npm run lint
npm test
npm run build
```

## 3. Subir el código a GitHub

```bash
git remote add origin git@github.com:<usuario>/<repositorio>.git
git push -u origin main
```

## 4. Variables de entorno

| Variable | Obligatoria | Valor |
|---|---|---|
| `RESEND_API_KEY` | Sí, para el correo | Clave creada en Resend → API Keys. |
| `LEADS_TO_EMAIL` | Sí, para el correo | Casilla que recibe las solicitudes de visita. |
| `LEADS_FROM_EMAIL` | Sí, para el correo | Remitente verificado, por ejemplo `Terravida <visitas@tudominio.cl>`. |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública sin barra final, por ejemplo `https://www.tudominio.cl`. |

Si faltan las tres variables de correo, el sitio funciona igual y el formulario sigue abriendo WhatsApp; solo deja de enviarse el correo (queda un error en los logs).

## 5. Configurar Resend

1. Crear la cuenta e ir a **Domains → Add Domain**.
2. Agregar los registros DNS que Resend indica en el proveedor del dominio y esperar a que el estado sea **Verified**.
3. Ir a **API Keys → Create API Key** con permiso **Sending access** y copiar la clave: es `RESEND_API_KEY`.
4. Usar como `LEADS_FROM_EMAIL` una dirección de ese dominio.

Para una prueba rápida sin dominio se puede usar `onboarding@resend.dev` como remitente, pero Resend solo entrega esos correos a la dirección con la que se creó la cuenta.

## 6. Crear el proyecto en Vercel

1. En Vercel: **Add New → Project** e importar el repositorio de GitHub.
2. Vercel detecta Next.js automáticamente. No cambiar el comando de build ni el directorio de salida. No se necesita `vercel.json`.
3. En **Environment Variables**, agregar las cuatro variables de la sección 4 para los entornos **Production** y **Preview**.
4. Pulsar **Deploy**.

Si todavía no hay dominio propio, usar la URL `https://<proyecto>.vercel.app` como `NEXT_PUBLIC_SITE_URL` y volver a desplegar.

## 7. Dominio propio

1. En el proyecto: **Settings → Domains → Add** e ingresar el dominio.
2. Crear en el DNS los registros que Vercel indica (normalmente un `A` para el dominio raíz y un `CNAME` para `www`).
3. Cuando el dominio aparezca como válido, actualizar `NEXT_PUBLIC_SITE_URL` y volver a desplegar desde **Deployments → Redeploy**.

Cada cambio en las variables de entorno requiere un nuevo despliegue para tener efecto.

## 8. Comprobar el despliegue

- [ ] La página carga y el menú móvil abre y cierra.
- [ ] Los filtros del catálogo muestran los lotes correctos.
- [ ] "Simular cuotas" lleva al simulador con el lote elegido.
- [ ] El simulador muestra "UF del dd/mm/aaaa". Si dice "valor de referencia", la API de la UF no respondió durante el build; se corrige solo en la siguiente regeneración.
- [ ] El botón del simulador abre WhatsApp con la cotización.
- [ ] El formulario de visita abre WhatsApp y llega un correo a `LEADS_TO_EMAIL`.
- [ ] Al compartir la URL en WhatsApp aparece la vista previa con título e imagen.

Si el correo no llega: revisar **Logs** del proyecto en Vercel (ruta `/api/leads`) y **Emails** en Resend. Una respuesta 503 indica variables faltantes; una 502, que Resend rechazó el envío (normalmente por un remitente no verificado).

## 9. Mantenimiento

Cada `git push` a `main` publica una nueva versión; las demás ramas generan una vista previa.

| Para cambiar | Editar |
|---|---|
| Lotes, precios en UF, estado y fotos | `src/data/lots.ts` |
| Opciones de pie, plazos, tasa y UF de respaldo | `src/data/credit.ts` |
| Teléfonos, WhatsApp, Instagram y mapa | `src/data/site.ts` |
| Pilares, métricas del hero y tiempos de viaje | `src/data/pillars.ts` |

Los precios en pesos no se editan: se calculan con la UF del día (mindicador.cl), que el sitio actualiza una vez cada 24 horas.

Las fotos propias van en `public/images/`. Para usar imágenes de otro dominio hay que agregarlo en `images.remotePatterns` de `next.config.ts`.
````

- [ ] **Step 3: README**

Reemplazar `README.md`:

```markdown
# Terravida

Landing de Terravida (parcelas en Refugio El Convento, Santo Domingo). Next.js, Tailwind CSS y TypeScript.

## Desarrollo

    npm install
    cp .env.example .env.local
    npm run dev

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run lint`: ESLint.
- `npm test`: tests unitarios (Vitest).

## Documentación

- Despliegue en Vercel: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)
- Diseño: [docs/superpowers/specs/2026-10-10-terravida-landing-design.md](docs/superpowers/specs/2026-10-10-terravida-landing-design.md)
```

- [ ] **Step 4: Verificación automática**

Run: `npm run lint && npm test && npm run build`
Expected: todo pasa. En la salida del build, la ruta `/` aparece como prerenderizada con revalidación y `/api/leads` como dinámica.

- [ ] **Step 5: Verificación manual en navegador**

Run: `npm run dev` y abrir http://localhost:3000. Comprobar a 375 px, 768 px y 1280 px de ancho:

1. Sin scroll horizontal en ningún ancho.
2. El menú móvil abre, cierra al tocar un enlace y el botón cambia de icono.
3. Los enlaces del header llevan a su sección sin que el header tape el título, y el enlace de la sección visible queda resaltado.
4. Filtros: "Planas" muestra solo Pradera C-12; "Todas" muestra los tres.
5. "Simular cuotas" en Mirador B-09 hace scroll al simulador, que muestra "Lote Mirador B-09" y 1.450 UF.
6. Con Convento A-04, 50% y 48 cuotas: pie 550 UF, saldo 550 UF, cuota 11,46 UF / mes.
7. Con 30% y 12 cuotas: pie 330 UF, saldo 770 UF, cuota 64,17 UF / mes.
8. El texto bajo el resultado muestra la fecha y el valor de la UF.
9. El botón del simulador abre WhatsApp con lote, pie, plazo y cuota.
10. El formulario exige nombre y teléfono; al enviar abre WhatsApp y muestra el mensaje de confirmación. Sin variables de entorno, `/api/leads` responde 503 en la pestaña de red y la interfaz no muestra error.
11. Navegación con teclado: el foco es visible en enlaces, chips, campos y botones.
12. Con "reducir movimiento" activado en el sistema, las secciones aparecen sin animación.

Corregir cualquier fallo antes de continuar.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: compose landing page and add Vercel deployment guide"
```
