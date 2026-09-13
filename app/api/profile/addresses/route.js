import db from '../../../../lib/db.js';
import { ok, fail, toAddress } from '../../../../lib/api.js';
import { requireUser } from '../../../../lib/auth.js';

async function addressesFor(userId) {
  const rows = await db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC', userId);
  return rows.map(toAddress);
}

export async function POST(request) {
  const user = await requireUser(request);
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

  await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', user.id);

  if (id) {
    await db.run(`
      UPDATE addresses SET label=?, full_name=?, line1=?, line2=?, city=?, state=?, zip=?, country=?, phone=?, is_default=1
      WHERE id=? AND user_id=?
    `, clean.label, clean.fullName, clean.line1, clean.line2, clean.city, clean.state, clean.zip, clean.country, clean.phone, id, user.id);
  } else {
    await db.run(`
      INSERT INTO addresses (user_id, label, full_name, line1, line2, city, state, zip, country, phone, is_default)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)
    `, user.id, clean.label, clean.fullName, clean.line1, clean.line2, clean.city, clean.state, clean.zip, clean.country, clean.phone);
  }

  return ok({ addresses: await addressesFor(user.id) });
}

export async function DELETE(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) return fail('Address id is required.');
  await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', id, user.id);
  return ok({ addresses: await addressesFor(user.id) });
}

export { addressesFor };