import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { requireAdmin, adminOrder, ORDER_STATUSES } from '../../../../../lib/admin.js';

export async function GET(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const number = decodeURIComponent(id);
  const row = db.prepare('SELECT * FROM orders WHERE number = ?').get(number);
  if (!row) return fail('Order not found.', 404);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
  return ok({ order: adminOrder(row, items) });
}

export async function PATCH(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const number = decodeURIComponent(id);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const status = String(body.status || '').trim();
  if (!ORDER_STATUSES.includes(status)) {
    return fail(`Status must be one of: ${ORDER_STATUSES.join(', ')}.`);
  }

  const info = db.prepare('UPDATE orders SET status = ? WHERE number = ?').run(status, number);
  if (!info.changes) return fail('Order not found.', 404);

  const row = db.prepare('SELECT * FROM orders WHERE number = ?').get(number);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
  return ok({ order: adminOrder(row, items) });
}