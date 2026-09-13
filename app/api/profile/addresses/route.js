import db from '../../../../lib/db.js';
import { ok, fail, toAddress } from '../../../../lib/api.js';
import { requireUser } from '../../../../lib/auth.js';

function addressesFor(userId) {
  const rows = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC').all(userId);
  return rows.map(toAddress);
}

export async function POST(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const a = body.address || {};
  const id = Number(a.id) || null;
  const fields = ['label', 'fullName', 'line1', 'line2', 'city', 'state', 'zip', 'country', 'phone'];
  const clean = {};
  for (const f of fields) {
    const val = f === 'fullName' ? 'full_name' : f;
    clean[f] = String(a[f] || '');
  }
  clean.country = clean.country || 'United States';

  db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(user.id);

  if (id) {
    db.prepare(`
      UPDATE addresses SET label=?, full_name=?, line1=?, line2=?, city=?, state=?, zip=?, country=?, phone=?, is_default=1
      WHERE id=? AND user_id=?
    `).run(clean.label, clean.fullName, clean.line1, clean.line2, clean.city, clean.state, clean.zip, clean.country, clean.phone, id, user.id);
  } else {
    db.prepare(`
      INSERT INTO addresses (user_id, label, full_name, line1, line2, city, state, zip, country, phone, is_default)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)
    `).run(user.id, clean.label, clean.fullName, clean.line1, clean.line2, clean.city, clean.state, clean.zip, clean.country, clean.phone);
  }

  return ok({ addresses: addressesFor(user.id) });
}

export async function DELETE(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) return fail('Address id is required.');
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, user.id);
  return ok({ addresses: addressesFor(user.id) });
}

export { addressesFor };