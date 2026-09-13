import db from '../../../lib/db.js';
import { ok, fail } from '../../../lib/api.js';
import { currentUser } from '../../../lib/auth.js';

export async function POST(request) {
  const user = await currentUser(request);
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const productId = String(body.productId || '');
  const rating = Math.floor(Number(body.rating));
  const title = String(body.title || '').trim();
  const text = String(body.body || '').trim();

  const product = await db.get('SELECT id FROM products WHERE id = ?', productId);
  if (!product) return fail('Product not found.', 404);
  if (!(rating >= 1 && rating <= 5)) return fail('Rating must be between 1 and 5.');
  if (!text) return fail('Please write a short review.');

  const authorName = user ? user.name : String(body.authorName || '').trim();
  if (!authorName) return fail('Please provide your name.');

  const inserted = await db.get(`
    INSERT INTO reviews (user_id, product_id, rating, title, body, author_name)
    VALUES (?,?,?,?,?,?) RETURNING id
  `, user?.id || null, productId, rating, title, text, authorName);

  const review = await db.get('SELECT * FROM reviews WHERE id = ?', inserted.id);
  return ok({ review: { id: review.id, rating, title, body: text, author: authorName, date: review.created_at } }, { status: 201 });
}