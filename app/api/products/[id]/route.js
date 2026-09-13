import db from '../../../../lib/db.js';
import { ok, fail, toProduct } from '../../../../lib/api.js';

export async function GET(request, { params }) {
  const { id } = await params;
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) return fail('Product not found.', 404);
  return ok({ product: toProduct(row) });
}