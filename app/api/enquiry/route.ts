import { Resend } from 'resend';
import { CONTACT } from '../../lib/site';
import { HONEYPOT, REQUIRED, validateEnquiry, type EnquiryValues } from '../../lib/enquiry';

// Receives every enquiry form (brief 7). Works with and without JavaScript:
// the form posts JSON when scripts run, and a normal form post otherwise, in
// which case the visitor is redirected back with ?enquiry=sent or =error.
//
// Environment (set in Vercel; placeholders in .env.example):
//   RESEND_API_KEY  Resend API key
//   RESEND_FROM     Verified sender, e.g. "Blaco Hill Farm Cottages <name@verified-domain>"

export const runtime = 'nodejs';

const TO = CONTACT.email;

type Payload = Partial<EnquiryValues> & { form?: string; page?: string; title?: string; [HONEYPOT]?: string };

async function readPayload(request: Request): Promise<{ payload: Payload; wantsJson: boolean }> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const payload = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v === 'string' ? v : ''])) as Payload;
    return { payload, wantsJson: true };
  }
  const data = await request.formData();
  const payload = Object.fromEntries([...data.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : ''])) as Payload;
  return { payload, wantsJson: false };
}

// Only same-site paths are accepted for the redirect back.
const safePage = (page?: string) => (page && /^\/[a-z0-9/-]*$/i.test(page) ? page : '/');

function respond(wantsJson: boolean, request: Request, page: string, status: number, body: Record<string, unknown>) {
  if (wantsJson) return Response.json(body, { status });
  const url = new URL(page, request.url);
  url.searchParams.set('enquiry', body.ok ? 'sent' : 'error');
  url.hash = 'enquiry';
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  const { payload, wantsJson } = await readPayload(request);
  const page = safePage(payload.page);
  const variant = payload.form === 'full' ? 'full' : 'quick';

  // Honeypot filled in: pretend it worked and send nothing.
  if (payload[HONEYPOT]) return respond(wantsJson, request, page, 200, { ok: true });

  const errors = validateEnquiry(payload, variant);
  if (Object.keys(errors).length) {
    return respond(wantsJson, request, page, 400, { ok: false, errors, message: 'Please check the highlighted fields.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from || apiKey.startsWith('re_placeholder')) {
    console.error('Enquiry not sent: RESEND_API_KEY or RESEND_FROM is not configured.');
    return respond(wantsJson, request, page, 500, { ok: false, message: 'send-failed' });
  }

  const values = Object.fromEntries(REQUIRED[variant].map((f) => [f, (payload[f] ?? '').trim()])) as Partial<EnquiryValues>;
  const title = (payload.title ?? '').trim().slice(0, 100) || 'Website enquiry';
  const lines = [
    `Form: ${title}`,
    `Page: ${page}`,
    '',
    `Name: ${values.name}`,
    ...(values.telephone ? [`Telephone: ${values.telephone}`] : []),
    `Email: ${values.email}`,
    '',
    'Message:',
    values.message ?? '',
  ];

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: TO,
      replyTo: values.email,
      subject: `${title}: ${values.name}`,
      text: lines.join('\n'),
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error('Enquiry not sent: Resend error', err);
    return respond(wantsJson, request, page, 502, { ok: false, message: 'send-failed' });
  }

  return respond(wantsJson, request, page, 200, { ok: true });
}
