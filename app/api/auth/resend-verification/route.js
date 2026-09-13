import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { issueToken } from '../../../../lib/auth.js';
import { verificationEmail, sendMail } from '../../../../lib/mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TTL = 24;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return ok({ ok: true });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.email_verified) return ok({ ok: true });

  // tokens are stored hashed, so a resend always issues a fresh one
  const origin = new URL(request.url).origin;
  const token = issueToken({ userId: user.id, type: 'verify', ttlHours: VERIFY_TTL });
  const link = `${origin}/#/verify?token=${token}`;
  const delivery = await sendMail(verificationEmail({
    to: user.email,
    name: user.name,
    link,
    ttlHours: VERIFY_TTL,
  }));
  const devLink = delivery.delivered === 'outbox' ? link : undefined;

  return ok({ ok: true, devLink });
}