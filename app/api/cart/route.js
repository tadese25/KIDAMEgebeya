import db from '../../../lib/db.js';
import { ok, fail } from '../../../lib/api.js';
import { requireUser } from '../../../lib/auth.js';
import { getCartFor, replaceCart } from '../../../lib/cart.js';

export async function GET(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);
  return ok(getCartFor(user.id));
}

export async function POST(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const id = String(body.productId || '');
  const qty = Math.floor(Number(body.qty));
  if (!id || !Number.isFinite(qty)) return fail('productId and qty are required.');

  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(id);
  if (!product) return fail('Product not found.', 404);

  const current = getCartFor(user.id).cart;
  if (qty <= 0) delete current[id];
  else current[id] = Math.min(qty, product.stock);

  return ok(replaceCart(user.id, current));
}

export async function DELETE(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  const id = new URL(request.url).searchParams.get('productId') || '';
  const current = getCartFor(user.id).cart;
  delete current[id];
  return ok(replaceCart(user.id, current));
}