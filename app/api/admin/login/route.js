import { ok, fail } from '../../../../lib/api.js';
import { ADMIN_PASSWORD, withAuthCookie, signAdminToken } from '../../../../lib/auth.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }
  if (String(body.password || '') !== ADMIN_PASSWORD) return fail('Invalid admin password.', 401);
  return withAuthCookie({ ok: true, admin: true }, signAdminToken());
}