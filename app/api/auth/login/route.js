import bcrypt from 'bcryptjs';
import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { signToken, withAuthCookie, publicUser } from '../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) return fail('Email and password are required.');

  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  const valid = user && !user.disabled && bcrypt.compareSync(password, user.password_hash);
  if (!valid) return fail('Incorrect email or password.', 401);
  if (!user.email_verified) {
    return ok({ error: 'Please verify your email before signing in. Check your inbox and click the verification link.', code: 'EMAIL_UNVERIFIED' }, { status: 403 });
  }

  return withAuthCookie({ user: publicUser(user) }, signToken(user.id));
}