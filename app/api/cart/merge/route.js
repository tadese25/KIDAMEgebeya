import { ok, fail } from '../../../../lib/api.js';
import { requireUser } from '../../../../lib/auth.js';
import { replaceCart } from '../../../../lib/cart.js';

export async function POST(request) {
  const user = requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const mapping = body.cart && typeof body.cart === 'object' ? body.cart
    : Array.isArray(body.items)
      ? body.items.reduce((acc, i) => { acc[i.productId] = i.qty; return acc; }, {})
      : {};
  return ok(replaceCart(user.id, mapping));
}