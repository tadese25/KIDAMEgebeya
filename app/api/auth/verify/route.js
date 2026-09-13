import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { consumeToken, signToken, withAuthCookie, publicUser } from '../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  const token = String(body.token || '');
  if (!token) return fail('Verification token is required.');

  const row = await consumeToken({ token, type: 'verify' });
  if (!row) return fail('This verification link is invalid or has expired. Request a new one.', 400);

  await db.run('UPDATE users SET email_verified = 1 WHERE id = ?', row.user_id);
  const user = await db.get('SELECT * FROM users WHERE id = ?', row.user_id);

  // verified → sign the user in
  return withAuthCookie({ user: publicUser(user), verified: true }, signToken(user.id));
}