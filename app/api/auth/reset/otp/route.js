import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { issueOtp } from '../../../../../lib/auth.js';
import { otpEmail, sendMail } from '../../../../../lib/mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MIN = 10;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return ok({ ok: true });

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) return ok({ ok: true }); // no account enumeration

  const code = await issueOtp({ userId: user.id, type: 'reset_otp', ttlMinutes: OTP_TTL_MIN });
  const delivery = await sendMail(otpEmail({
    to: user.email,
    name: user.name,
    code,
    purpose: 'reset',
    ttlMinutes: OTP_TTL_MIN,
  }));
  const devOtp = delivery.delivered === 'outbox' ? code : undefined;

  return ok({ ok: true, devOtp, expiresMinutes: OTP_TTL_MIN });
}