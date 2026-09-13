import db from '../../../lib/db.js';
import { ok, fail } from '../../../lib/api.js';
import { currentUser } from '../../../lib/auth.js';

export async function POST(request) {
  const user = currentUser(request);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const productId = String(body.productId || '');
  const rating = Math.floor(Number(body.rating));
  const title = String(body.title || '').trim();
  const text = String(body.body || '').trim();

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) return fail('Product not found.', 404);
  if (!(rating >= 1 && rating <= 5)) return fail('Rating must be between 1 and 5.');
  if (!text) return fail('Please write a short review.');

  const authorName = user ? user.name : String(body.authorName || '').trim();
  if (!authorName) return fail('Please provide your name.');

  const info = db.prepare(`
    INSERT INTO reviews (user_id, product_id, rating, title, body, author_name, created_at)
    VALUES (?,?,?,?,?,?,?)
  `).run(user?.id || null, productId, rating, title, text, authorName, new Date().toISOString().slice(0, 19).replace('T', ' '));

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid);
  return ok({ review: { id: review.id, rating, title, body: text, author: authorName, date: review.created_at } }, { status: 201 });
}