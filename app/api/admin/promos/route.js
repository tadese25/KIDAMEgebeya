import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { requireAdmin } from '../../../../lib/admin.js';

export function promoRow(row) {
  return { code: row.code, type: row.type, value: row.value, active: !!row.active };
}

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const rows = await db.all('SELECT * FROM promo_codes ORDER BY code');
  return ok({ promos: rows.map(promoRow) });
}

export async function POST(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const code = String(body.code || '').trim().toUpperCase().replace(/\s+/g, '');
  const type = String(body.type || '');
  const value = Number(body.value || 0);

  if (!code) return fail('Promo code is required.');
  if (!['percent', 'free_shipping'].includes(type)) return fail('Type must be percent or free_shipping.');
  if (type === 'percent' && !(value > 0 && value <= 100)) return fail('Percent value must be between 0 and 100.');

  const exists = await db.get('SELECT code FROM promo_codes WHERE code = ?', code);
  if (exists) return fail('That promo code already exists.');

  await db.run('INSERT INTO promo_codes (code, type, value, active) VALUES (?,?,?,?)',
    code, type, type === 'percent' ? value / 100 : 0, 1);
  const row = await db.get('SELECT * FROM promo_codes WHERE code = ?', code);
  return ok({ promo: promoRow(row) }, { status: 201 });
}