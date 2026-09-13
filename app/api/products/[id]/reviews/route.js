import db from '../../../../../lib/db.js';
import { ok, fail } from '../../../../../lib/api.js';

export async function GET(request, { params }) {
  const { id } = await params;
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!product) return fail('Product not found.', 404);

  const rows = db.prepare(`
    SELECT r.id, r.rating, r.title, r.body, r.created_at, u.name AS user_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC, r.id DESC
  `).all(id);

  const reviews = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    author: r.user_name || r.author_name || 'Verified Customer',
    date: r.created_at,
  }));
  return ok({ reviews });
}