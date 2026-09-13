import bcrypt from 'bcryptjs';
import db from '../../../../../../lib/db.js';
import { ok, fail } from '../../../../../../lib/api.js';
import { consumeOtp } from '../../../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  const password = String(body.password || '');

  if (!/^\d{6}$/.test(code)) return fail('That code is invalid or has expired. Request a new one.', 400);
  if (password.length < 6) return fail('Password must be at least 6 characters.');

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) return fail('That code is invalid or has expired. Request a new one.', 400);

  const row = await consumeOtp({ userId: user.id, type: 'reset_otp', code });
  if (!row) return fail('That code is invalid or has expired. Request a new one.', 400);

  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', bcrypt.hashSync(password, 10), user.id);
  return ok({ ok: true });
}