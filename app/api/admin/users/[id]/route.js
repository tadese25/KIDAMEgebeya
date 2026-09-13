import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';
import { requireAdmin } from '../../../../../lib/admin.js';

export async function PATCH(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const userId = Number(decodeURIComponent(id));
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  if (!user) return fail('User not found.', 404);

  if (body.disabled != null) {
    await db.run('UPDATE users SET disabled = ? WHERE id = ?', body.disabled ? 1 : 0, userId);
  }
  const updated = await db.get(`
    SELECT u.id, u.name, u.email, u.created_at, u.disabled,
      (SELECT COUNT(*)::int FROM orders o WHERE o.user_id = u.id) AS order_count,
      (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) AS spent
    FROM users u WHERE u.id = ?
  `, userId);
  return ok({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      createdAt: updated.created_at,
      disabled: !!updated.disabled,
      orderCount: updated.order_count,
      spent: Math.round(updated.spent * 100) / 100,
    },
  });
}