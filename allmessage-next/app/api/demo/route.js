import { NextResponse } from 'next/server';

const REQUIRED = ['azienda', 'referente', 'email', 'telefono', 'settore', 'ruolo', 'interesse', 'messaggio'];

// Receives "Richiedi Demo" requests. Set DEMO_FORWARD_URL to pass them on
// (e.g. to a CRM or form-to-email service) as a JSON POST.
export async function POST(request) {
  let data;
  try { data = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }

  const missing = REQUIRED.filter(k => !String(data?.[k] ?? '').trim());
  if (missing.length || data.consenso !== true) {
    return NextResponse.json({ ok: false, error: 'missing_fields', missing }, { status: 422 });
  }

  const lead = Object.fromEntries(REQUIRED.map(k => [k, String(data[k]).trim().slice(0, 2000)]));
  lead.receivedAt = new Date().toISOString();

  const forwardUrl = process.env.DEMO_FORWARD_URL;
  if (forwardUrl) {
    const res = await fetch(forwardUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'forward_failed' }, { status: 502 });
  } else {
    console.log('[richiedi-demo]', lead);
  }
  return NextResponse.json({ ok: true });
}
