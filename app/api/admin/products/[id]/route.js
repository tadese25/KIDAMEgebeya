import db from '../../../../../lib/db.js';
import { ok, fail, toProduct } from '../../../../../lib/api.js';
import { requireAdmin } from '../../../../../lib/admin.js';

export async function PUT(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const pid = decodeURIComponent(id);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(pid);
  if (!product) return fail('Product not found.', 404);

  const name = body.name != null ? String(body.name).trim() : product.name;
  const category = body.category != null ? String(body.category).trim() : product.category;
  const price = body.price != null ? Number(body.price) : product.price;

  if (!name) return fail('Product name is required.');
  if (!(price > 0)) return fail('Price must be greater than zero.');

  if (body.category) {
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category);
    if (!cat) return fail('Category not found.');
  }

  db.prepare(`UPDATE products SET
    name = ?, category = ?, brand = ?, price = ?, old_price = ?, featured = ?,
    tag = ?, colors = ?, sizes = ?, description = ?, specs = ?, images = ?, stock = ?
    WHERE id = ?`).run(
    name, category,
    body.brand != null ? String(body.brand) : product.brand,
    price,
    body.oldPrice != null ? Number(body.oldPrice) : product.old_price,
    body.featured != null ? (body.featured ? 1 : 0) : product.featured,
    body.tag != null ? body.tag : product.tag,
    JSON.stringify(body.colors != null ? body.colors : JSON.parse(product.colors || '[]')),
    JSON.stringify(body.sizes != null ? body.sizes : JSON.parse(product.sizes || '[]')),
    body.description != null ? String(body.description) : product.description,
    JSON.stringify(body.specs != null ? body.specs : JSON.parse(product.specs || '[]')),
    JSON.stringify(body.images != null ? body.images : JSON.parse(product.images || '[]')),
    body.stock != null ? Math.floor(Number(body.stock)) : product.stock,
    pid,
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(pid);
  return ok({ product: toProduct(updated) });
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const { id } = await params;
  const pid = decodeURIComponent(id);
  const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(pid);
  if (!exists) return fail('Product not found.', 404);
  db.prepare('DELETE FROM products WHERE id = ?').run(pid);
  return ok({ deleted: pid });
}