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
