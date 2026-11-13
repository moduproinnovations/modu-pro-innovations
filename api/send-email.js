// Vercel serverless function: send an email via Resend.
// Env: RESEND_API_KEY (required), RESEND_FROM (optional).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    return;
  }
  const { to, subject, html, text } = req.body || {};
  if (!to || !subject || (!html && !text)) {
    res.status(400).json({ error: 'Missing to/subject/content' });
    return;
  }
  const from = process.env.RESEND_FROM || 'Modu Pro <onboarding@resend.dev>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html, text }),
    });
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: data?.message || 'Resend error', details: data });
      return;
    }
    res.status(200).json({ success: true, id: data?.id });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
