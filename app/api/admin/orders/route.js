import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { requireAdmin, adminOrder, ORDER_STATUSES } from '../../../../lib/admin.js';

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  let rows;
  if (status && ORDER_STATUSES.includes(status)) {
    rows = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC').all(status);
  } else {
    rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  }
  const orders = rows.map((row) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
    return adminOrder(row, items);
  });
  return ok({ orders });
}