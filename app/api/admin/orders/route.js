import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { requireAdmin, adminOrder, ORDER_STATUSES } from '../../../../lib/admin.js';

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  let rows;
  if (status && ORDER_STATUSES.includes(status)) {
    rows = await db.all('SELECT * FROM orders WHERE status = ? ORDER BY id DESC', status);
  } else {
    rows = await db.all('SELECT * FROM orders ORDER BY id DESC');
  }
  const orders = [];
  for (const row of rows) {
    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', row.id);
    orders.push(adminOrder(row, items));
  }
  return ok({ orders });
}