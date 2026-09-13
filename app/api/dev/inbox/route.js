import { ok, fail } from '../../../../lib/api.js';
import { listOutbox } from '../../../../lib/mailer.js';

export async function GET(request) {
  // Local-development only: mirrors the outbox so E2E can read tokens.
  if (process.env.NODE_ENV === 'production') return fail('Not available in production.', 404);
  const email = new URL(request.url).searchParams.get('email') || '';
  return ok({ emails: listOutbox(email ? { email } : {}) });
}