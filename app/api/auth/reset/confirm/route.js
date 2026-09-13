import bcrypt from 'bcryptjs';
import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { consumeToken } from '../../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const token = String(body.token || '');
  const password = String(body.password || '');

  if (!token) return fail('Reset token is required.');
  if (password.length < 6) return fail('Password must be at least 6 characters.');

  const row = consumeToken({ token, type: 'reset' });
  if (!row) return fail('This reset link is invalid or has expired. Request a new one.', 400);

  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);

  return ok({ ok: true, email: db.prepare('SELECT email FROM users WHERE id = ?').get(row.user_id)?.email });
}