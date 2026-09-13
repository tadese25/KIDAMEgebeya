import { ok, fail } from '../../../lib/api.js';
import { requireUser } from '../../../lib/auth.js';
import { getWishlist, toggleWishlist } from '../../../lib/wishlist.js';

export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);
  return ok({ wishlist: await getWishlist(user.id) });
}

export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const id = String(body.productId || '');
  if (!id) return fail('productId is required.');

  const wishlist = await toggleWishlist(user.id, id);
  return ok({ wishlist, wishlisted: wishlist.includes(id) });
}

export async function DELETE(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);
  const id = new URL(request.url).searchParams.get('productId') || '';
  const list = (await getWishlist(user.id)).filter((x) => x !== id);
  return ok({ wishlist: list });
}