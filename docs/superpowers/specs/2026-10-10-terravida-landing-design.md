# Terravida — Landing en Next.js (diseño)

Fecha: 2026-10-10
Referencia: https://terravida.tq9grx.easypanel.host/

## 1. Objetivo

Reconstruir la landing de Terravida (parcelas de 5.000 m² en Refugio El Convento, Santo Domingo) en Next.js, con las mismas funcionalidades del sitio actual, una apariencia similar pero mejorada, y lista para desplegar en Vercel.

El sitio existe para generar leads: que la persona simule una cuota o agende una visita y termine escribiendo por WhatsApp.

Criterios de éxito:

- Todas las secciones y funciones del sitio de referencia están presentes y funcionan en móvil, notebook y escritorio.
- El simulador entrega cifras coherentes entre UF y pesos, con la UF del día.
- Cada solicitud de visita llega por correo, aunque la persona no envíe el WhatsApp.
- `npm run build`, `npm run lint` y `npm test` pasan, y el proyecto se despliega en Vercel siguiendo `docs/DEPLOY_VERCEL.md` sin pasos adicionales.

## 2. Alcance

Incluido (paridad con la referencia):

| Sección | Función |
|---|---|
| Header | Fijo arriba, navegación por anclas, CTA de WhatsApp y "Agendar visita", menú móvil desplegable que se cierra al navegar. |
| Hero | Titular, 4 métricas, CTAs, imagen con tarjeta de precio "desde" y enlace al simulador. |
| Pilares | 4 tarjetas: luz soterrada, rol propio, crédito directo, mar y naturaleza. |
| Catálogo | Tarjetas de lotes con estado, precio en UF y pesos, filtros (todas, vista al mar/lomaje, planas) y botón "Simular cuotas" que carga el lote en el simulador y hace scroll. |
| Simulador | Selección de pie y plazo, resultado (pie, saldo, cuota en UF y pesos) y envío de la simulación por WhatsApp. |
| Ubicación | 3 tiempos de viaje y enlace a Google Maps. |
| Formulario de visita | Nombre, teléfono y fecha; abre WhatsApp con el mensaje armado. |
| Footer y botón flotante | Teléfonos, Instagram, botón de WhatsApp siempre visible. |

Mejoras sobre la referencia:

- Pesos calculados con la UF del día en vez de valores escritos a mano.
- Simulador con aviso legal y condiciones en un único archivo de configuración.
- El formulario de visita también envía el lead por correo.
- Fuentes e imágenes optimizadas, SEO y Open Graph, accesibilidad y animaciones sutiles de entrada.

Fuera de alcance: CMS o panel de administración, reserva o pago en línea, varios idiomas, analítica, límite de peticiones con almacenamiento externo.

## 3. Stack

- Next.js (última versión estable) con App Router y TypeScript.
- Tailwind CSS, con los tokens de marca de la referencia (negro, dorado, oliva, marfil).
- Solo componentes funcionales. Componentes de servidor por defecto; `"use client"` solo donde hay interacción.
- `next/font` para EB Garamond, Cinzel y Plus Jakarta Sans. Iconos como SVG (`lucide-react`) en lugar de la fuente Material Symbols.
- Zod para validar el lead, Resend para el correo, Vitest para los tests.

## 4. Arquitectura

```
src/
  app/
    layout.tsx            Fuentes, metadata, fondo decorativo
    page.tsx              Obtiene la UF y compone las secciones
    globals.css           Tokens y utilidades (degradado dorado, grano, retícula)
    api/leads/route.ts    Recibe el lead y envía el correo
  components/
    layout/               Header, MobileMenu, Footer, WhatsAppFab, BackgroundDecor
    sections/             Hero, Pillars, Catalog, Simulator, Location, VisitForm
    ui/                   Button, Card, SectionHeading, Chip, Reveal
    providers/            LotSelectionProvider
  data/
    site.ts               Contacto, redes, navegación, textos de WhatsApp
    lots.ts               Lotes (nombre, precio en UF, categoría, estado, imagen)
    credit.ts             Opciones de pie, plazos, tasa, pie mínimo
    pillars.ts            Pilares y tiempos de viaje
  lib/
    credit.ts             Cálculo puro de la simulación
    uf.ts                 Obtención de la UF con respaldo
    whatsapp.ts           Construcción de enlaces wa.me
    format.ts             Formato de UF y pesos (es-CL)
    leads.ts              Esquema Zod del lead
```

Reglas de dependencia: `sections` usa `ui`, `data` y `lib`; `lib` no importa componentes; `data` no importa nada del proyecto salvo tipos.

### Estado compartido

El catálogo y el simulador comparten el lote seleccionado. `LotSelectionProvider` (contexto de cliente) expone `selectedLot` y `selectLot(id)`. El catálogo llama a `selectLot` y hace scroll al simulador; el simulador lee `selectedLot`. El pie y el plazo son estado local del simulador.

## 5. Simulador de crédito

El precio en UF de cada lote es la única fuente de verdad. Los pesos siempre se derivan de la UF.

Configuración (`data/credit.ts`):

- `downPaymentOptions`: 30% y 50%
- `termOptions`: 12, 24, 36 y 48 meses
- `monthlyRate`: 0

Cálculo (`lib/credit.ts`, función pura `simulate({ priceUf, downPaymentPct, months, monthlyRate, ufValue })`):

- `pie = precio × porcentaje`
- `saldo = precio − pie`
- Con tasa 0: `cuota = saldo / meses`
- Con tasa mayor que 0: cuota de amortización francesa. Se implementa para que cambiar la tasa sea editar un número, no reescribir el simulador.
- Los pesos se calculan como `UF × ufValue` y se redondean al peso.

Presentación:

- Las cuotas se rotulan "fijas en UF"; los pesos se muestran como "referencia a la UF del día" con la fecha del valor.
- Aviso bajo el resultado: simulación referencial, no constituye oferta ni aprobación de crédito; las condiciones finales se formalizan con la inmobiliaria.
- El texto "Pie desde X%" del hero se calcula desde `downPaymentOptions`, de modo que no pueda contradecir al simulador.
- El botón de WhatsApp envía lote, pie, plazo y cuota.

### UF del día

`lib/uf.ts` consulta `https://mindicador.cl/api/uf` desde el servidor con revalidación cada 24 horas. Si la consulta falla o devuelve un valor no válido, usa un valor de respaldo definido en `data/credit.ts` y la interfaz muestra "valor de referencia" en lugar de la fecha. La página nunca falla por culpa de la UF.

## 6. Leads

Al enviar el formulario de visita ocurren dos cosas en paralelo:

1. Se abre WhatsApp con el mensaje armado, de forma síncrona en el clic para que el navegador no bloquee la ventana.
2. Se hace `POST /api/leads` con nombre, teléfono y fecha.

`/api/leads`:

- Valida con Zod (nombre y teléfono obligatorios, fecha opcional, límites de longitud).
- Incluye un campo trampa oculto; si viene relleno responde 200 sin enviar nada.
- Envía un correo con Resend a `LEADS_TO_EMAIL`.
- Respuestas: 200 enviado, 400 datos no válidos, 503 si falta configuración, 502 si falla el proveedor.

Errores: un fallo del correo no bloquea ni afecta el flujo de WhatsApp; se registra en los logs de Vercel. El formulario muestra un mensaje de confirmación tras el envío.

Variables de entorno:

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Clave del proveedor de correo (solo servidor). |
| `LEADS_TO_EMAIL` | Casilla que recibe los leads. |
| `LEADS_FROM_EMAIL` | Remitente verificado en Resend. |
| `NEXT_PUBLIC_SITE_URL` | URL pública, para metadata y Open Graph. |

El botón del simulador solo abre WhatsApp: no recoge datos de contacto, así que no genera correo.

## 7. Diseño visual

Se conserva la identidad de la referencia: fondo negro, dorado metálico, tipografía serif editorial, curvas de nivel topográficas y textura de grano. Mejoras:

- Texto de cuerpo más grande (la referencia usa muchos tamaños de 8 a 11 px) y mejor contraste.
- Espaciado y jerarquía más consistentes entre secciones.
- Entrada suave de las secciones al hacer scroll, desactivada con `prefers-reduced-motion`.
- Estados de foco visibles, objetivos táctiles de al menos 44 px y `aria` en menú, filtros y opciones del simulador.
- Enlace de la sección activa resaltado en el header.

Imágenes: se reutilizan `logo.png` y `parcela_post_1.jpg` del sitio actual. Las dos fotos de Unsplash de los lotes B-09 y C-12 quedan como provisionales hasta tener fotos propias.

## 8. Tests y verificación

- Vitest para `lib/credit.ts` (tasa 0, tasa mayor que 0, redondeo), `lib/whatsapp.ts`, `lib/format.ts` y el esquema de `lib/leads.ts`.
- Test del handler `/api/leads` con el proveedor de correo simulado: datos válidos, no válidos, campo trampa y falta de configuración.
- Verificación manual en navegador de menú móvil, filtros, selección de lote, simulador y formulario.

## 9. Despliegue

`docs/DEPLOY_VERCEL.md` cubre: requisitos, subir el repo a GitHub, importar el proyecto en Vercel, configurar las variables de entorno, verificar el dominio remitente en Resend, conectar un dominio propio, comprobar el despliegue y cómo actualizar lotes y condiciones de crédito.

No se necesita `vercel.json`: la configuración por defecto de Next.js en Vercel es suficiente.

## 10. Pendientes del negocio

No bloquean el desarrollo, pero deben resolverse antes de publicar:

- Confirmar con el abogado de la inmobiliaria si la oferta de crédito directo obliga a informar tasa y costo total según la Ley del Consumidor.
- Confirmar las condiciones reales: pie mínimo (30% o 50%) y si las cuotas son en UF o en pesos.
- Reemplazar las fotos provisionales de los lotes.
