import db from '../../../../../../lib/db.js';
import { ok, fail } from '../../../../../../lib/api.js';
import { consumeOtp, signToken, withAuthCookie, publicUser } from '../../../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user || !/^\d{6}$/.test(code)) return fail('That code is invalid or has expired. Request a new one.', 400);

  const row = await consumeOtp({ userId: user.id, type: 'verify_otp', code });
  if (!row) return fail('That code is invalid or has expired. Request a new one.', 400);

  await db.run('UPDATE users SET email_verified = 1 WHERE id = ?', user.id);
  const fresh = await db.get('SELECT * FROM users WHERE id = ?', user.id);
  return withAuthCookie({ user: publicUser(fresh), verified: true }, signToken(fresh.id));
}