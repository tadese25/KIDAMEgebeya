import bcrypt from 'bcryptjs';
import db from '../../../../lib/db.js';
import { ok, fail } from '../../../../lib/api.js';
import { issueToken } from '../../../../lib/auth.js';
import { verificationEmail, sendMail } from '../../../../lib/mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TTL = 24;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!name) return fail('Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail('Please enter a valid email address.');
  if (password.length < 6) return fail('Password must be at least 6 characters.');

  const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
  if (existing) return fail('An account with that email already exists.', 409);

  const hash = bcrypt.hashSync(password, 10);
  const inserted = await db.get(
    'INSERT INTO users (name, email, password_hash, email_verified) VALUES (?,?,?,0) RETURNING id',
    name, email, hash
  );
  const userId = inserted.id;

  const origin = new URL(request.url).origin;
  const token = await issueToken({ userId, type: 'verify', ttlHours: VERIFY_TTL });
  const link = `${origin}/#/verify?token=${token}`;
  const delivery = await sendMail(verificationEmail({
    to: email,
    name,
    link,
    ttlHours: VERIFY_TTL,
  }));

  // If the email can't be delivered, don't leave the customer locked behind
  // a verification email they'll never receive — roll the account back.
  if (delivery.failed) {
    await db.run('DELETE FROM users WHERE id = ?', userId);
    return fail('We could not deliver the verification email. Please try again in a moment.', 500);
  }
  const devLink = delivery.delivered === 'outbox' ? link : undefined;

  return ok({ ok: true, email, verifyRequired: true, devLink }, { status: 201 });
}