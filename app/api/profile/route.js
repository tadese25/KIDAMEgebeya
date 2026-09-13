import db from '../../../lib/db.js';
import { ok, fail, toAddress } from '../../../lib/api.js';
import { requireUser } from '../../../lib/auth.js';

function addressesFor(userId) {
  const rows = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC').all(userId);
  return rows.map(toAddress);
}

export async function GET(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);
  const row = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(user.id);
  return ok({ user, addresses: addressesFor(user.id) });
}

export async function PUT(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (name && name.length < 2) return fail('Name looks too short.');

  const existing = email ? db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id) : null;
  if (existing) return fail('That email is already in use.', 409);

  if (name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, user.id);
  if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, user.id);

  const row = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(user.id);
  return ok({ user: { id: row.id, name: row.name, email: row.email, createdAt: row.created_at }, addresses: addressesFor(user.id) });
}