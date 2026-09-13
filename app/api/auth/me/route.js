import db from '../../../../lib/db.js';
import { ok } from '../../../../lib/api.js';
import { currentUser } from '../../../../lib/auth.js';

export async function GET(request) {
  const user = currentUser(request);
  if (!user) {
    return ok({ user: null });
  }
  return ok({ user });
}