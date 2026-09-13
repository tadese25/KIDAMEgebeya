import { clearAuthCookie } from '../../../../lib/auth.js';

export async function POST() {
  return clearAuthCookie();
}