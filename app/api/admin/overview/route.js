import { ok, fail } from '../../../../lib/api.js';
import { requireAdmin, overview } from '../../../../lib/admin.js';

export async function GET(request) {
  if (!requireAdmin(request)) return fail('Administrator access required.', 401);
  return ok({ overview: overview() });
}