import db from '../../../lib/db.js';
import { ok, fail, toAddress } from '../../../lib/api.js';
import { requireUser } from '../../../lib/auth.js';

async function addressesFor(userId) {
  const rows = await db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC', userId);
  return rows.map(toAddress);
}

export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);
  const row = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', user.id);
  return ok({ user, addresses: await addressesFor(user.id) });
}

export async function PUT(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (name && name.length < 2) return fail('Name looks too short.');

  const existing = email ? await db.get('SELECT id FROM users WHERE email = ? AND id != ?', email, user.id) : null;
  if (existing) return fail('That email is already in use.', 409);

  if (name) await db.run('UPDATE users SET name = ? WHERE id = ?', name, user.id);
  if (email) await db.run('UPDATE users SET email = ? WHERE id = ?', email, user.id);

  const row = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', user.id);
  return ok({ user: { id: row.id, name: row.name, email: row.email, createdAt: row.created_at }, addresses: await addressesFor(user.id) });
}