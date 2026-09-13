import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { requireAdmin } from '../../../../../lib/admin.js';
import { promoRow } from '../route.js';

export async function PATCH(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const code = decodeURIComponent(id).toUpperCase();
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const exists = await db.get('SELECT code FROM promo_codes WHERE code = ?', code);
  if (!exists) return fail('Promo code not found.', 404);

  if (body.active != null) {
    await db.run('UPDATE promo_codes SET active = ? WHERE code = ?', body.active ? 1 : 0, code);
  }
  if (body.type != null) {
    const type = String(body.type);
    if (!['percent', 'free_shipping'].includes(type)) return fail('Type must be percent or free_shipping.');
    const value = type === 'percent' ? (Number(body.value || 0) / 100) : 0;
    await db.run('UPDATE promo_codes SET type = ?, value = ? WHERE code = ?', type, value, code);
  }

  const row = await db.get('SELECT * FROM promo_codes WHERE code = ?', code);
  return ok({ promo: promoRow(row) });
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const code = decodeURIComponent(id).toUpperCase();
  const info = await db.run('DELETE FROM promo_codes WHERE code = ?', code);
  if (!info.changes) return fail('Promo code not found.', 404);
  return ok({ deleted: code });
}