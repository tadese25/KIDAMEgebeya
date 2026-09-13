import { ok, fail } from '../../../../lib/api.js';
import { requireUser } from '../../../../lib/auth.js';
import { replaceWishlist } from '../../../../lib/wishlist.js';

export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return fail('Authentication required.', 401);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const ids = Array.isArray(body.wishlist) ? body.wishlist : [];
  return ok({ wishlist: await replaceWishlist(user.id, ids) });
}