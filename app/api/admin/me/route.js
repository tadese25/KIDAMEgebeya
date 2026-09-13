import { ok, fail } from '../../../../lib/api.js';
import { currentAdmin } from '../../../../lib/auth.js';

export async function GET(request) {
  if (!currentAdmin(request)) return fail('Administrator access required.', 401);
  return ok({ admin: true });
}