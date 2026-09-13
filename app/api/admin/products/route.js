import db from '../../../../lib/db.js';
import { ok, fail, toProduct } from '../../../../lib/api.js';
import { requireAdmin } from '../../../../lib/admin.js';

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  const rows = await db.all('SELECT * FROM products ORDER BY name');
  return ok({ products: rows.map(toProduct) });
}

export async function POST(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const id = String(body.id || '').trim().replace(/[^a-z0-9\-]/g, '');
  const name = String(body.name || '').trim();
  const category = String(body.category || '').trim();
  const price = Number(body.price);

  if (!id) return fail('A valid product id (slug) is required.');
  if (!name) return fail('Product name is required.');
  if (!category) return fail('Product category is required.');
  if (!(price > 0)) return fail('Price must be greater than zero.');

  const cat = await db.get('SELECT id FROM categories WHERE id = ?', category);
  if (!cat) return fail('Category not found.');

  const exists = await db.get('SELECT id FROM products WHERE id = ?', id);
  if (exists) return fail('A product with that id already exists.');

  await db.run(`INSERT INTO products
    (id, name, category, brand, price, old_price, rating, reviews_count, stock, featured, tag, colors, sizes, description, specs, images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    id, name, category,
    String(body.brand || 'NOVA'),
    price,
    body.oldPrice != null ? Number(body.oldPrice) : null,
    Number(body.rating || 0),
    Math.floor(Number(body.reviewsCount || 0)),
    Math.floor(Number(body.stock || 0)),
    body.featured ? 1 : 0,
    body.tag || null,
    JSON.stringify(body.colors || []),
    JSON.stringify(body.sizes || []),
    String(body.description || ''),
    JSON.stringify(body.specs || []),
    JSON.stringify(body.images || []),
  );

  const row = await db.get('SELECT * FROM products WHERE id = ?', id);
  return ok({ product: toProduct(row) }, { status: 201 });
}