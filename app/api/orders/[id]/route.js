import { ok, fail } from '../../../../lib/api.js';
import { currentUser } from '../../../../lib/auth.js';
import { loadOrder } from '../route.js';

export async function GET(request, { params }) {
  const user = currentUser(request);
  if (!user) return fail('Authentication required.', 401);

  const { id } = await params;
  const found = loadOrder(id);
  if (!found || found.row.user_id !== user.id) return fail('Order not found.', 404);
  return ok({ order: found.order });
}