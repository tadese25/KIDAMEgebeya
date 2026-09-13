import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { issueToken } from '../../../../../lib/auth.js';
import { resetEmail, sendMail } from '../../../../../lib/mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TTL = 1;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return ok({ ok: true });

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) return ok({ ok: true }); // don't leak whether an account exists

  const origin = new URL(request.url).origin;
  const token = await issueToken({ userId: user.id, type: 'reset', ttlHours: RESET_TTL });
  const link = `${origin}/#/reset?token=${token}`;
  const delivery = await sendMail(resetEmail({
    to: user.email,
    name: user.name,
    link,
    ttlHours: RESET_TTL,
  }));
  const devLink = delivery.delivered === 'outbox' ? link : undefined;

  return ok({ ok: true, devLink });
}