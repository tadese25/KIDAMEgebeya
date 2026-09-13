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

  const exists = db.prepare('SELECT code FROM promo_codes WHERE code = ?').get(code);
  if (!exists) return fail('Promo code not found.', 404);

  if (body.active != null) {
    db.prepare('UPDATE promo_codes SET active = ? WHERE code = ?').run(body.active ? 1 : 0, code);
  }
  if (body.type != null) {
    const type = String(body.type);
    if (!['percent', 'free_shipping'].includes(type)) return fail('Type must be percent or free_shipping.');
    const value = type === 'percent' ? (Number(body.value || 0) / 100) : 0;
    db.prepare('UPDATE promo_codes SET type = ?, value = ? WHERE code = ?').run(type, value, code);
  }

  const row = db.prepare('SELECT * FROM promo_codes WHERE code = ?').get(code);
  return ok({ promo: promoRow(row) });
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const code = decodeURIComponent(id).toUpperCase();
  const info = db.prepare('DELETE FROM promo_codes WHERE code = ?').run(code);
  if (!info.changes) return fail('Promo code not found.', 404);
  return ok({ deleted: code });
}