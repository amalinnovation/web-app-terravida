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

Si falta alguna de las tres variables de correo, el sitio funciona igual y el formulario sigue abriendo WhatsApp; solo deja de enviarse el correo (queda un error en los logs).

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
- [ ] El simulador muestra "UF del dd/mm/aaaa". Si dice "valor de referencia", la API de la UF no respondió; el sitio lo reintenta solo en la siguiente hora.
- [ ] El botón del simulador abre WhatsApp con la cotización.
- [ ] El formulario de visita abre WhatsApp y llega un correo a `LEADS_TO_EMAIL`.
- [ ] Al compartir la URL en WhatsApp aparece la vista previa con título e imagen.

Si el correo no llega: revisar **Logs** del proyecto en Vercel (ruta `/api/leads`) y **Emails** en Resend. Una respuesta 503 indica variables faltantes; una 502, que Resend rechazó el envío (normalmente por un remitente no verificado).

## 9. Mantenimiento

Cada `git push` a `main` publica una nueva versión; las demás ramas generan una vista previa.

| Para cambiar | Editar |
|---|---|
| Lotes, precios en UF, estado y fotos | `src/data/lots.ts` |
| Pie, plazos, reserva, plazo de escritura y UF de respaldo | `src/data/credit.ts` |
| Teléfonos, WhatsApp, Instagram y mapa | `src/data/site.ts` |
| Pilares, métricas del hero y tiempos de viaje | `src/data/pillars.ts` |
| Fotos y videos de la galería y del carrusel | `src/data/gallery.ts` (archivos en `public/assets/`) |

Los precios en pesos no se editan: se calculan con la UF del día (mindicador.cl). El valor se guarda en caché por un día (`src/lib/uf.ts`) y la página se regenera sola con el valor nuevo, sin necesidad de volver a desplegar.

Las fotos propias van en `public/images/`. Para usar imágenes de otro dominio hay que agregarlo en `images.remotePatterns` de `next.config.ts`.
