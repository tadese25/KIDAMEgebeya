import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { requireAdmin } from '../../../../lib/admin.js';

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at, u.disabled,
      (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
      (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) AS spent
    FROM users u
    ORDER BY u.id DESC
  `).all();
  return ok({
    users: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      createdAt: r.created_at,
      disabled: !!r.disabled,
      orderCount: r.order_count,
      spent: Math.round(r.spent * 100) / 100,
    })),
  });
}