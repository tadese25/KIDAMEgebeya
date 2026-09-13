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

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return fail('An account with that email already exists.', 409);

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, email, password_hash, email_verified) VALUES (?,?,?,0)')
    .run(name, email, hash);
  const userId = info.lastInsertRowid;

  const origin = new URL(request.url).origin;
  const token = issueToken({ userId, type: 'verify', ttlHours: VERIFY_TTL });
  const link = `${origin}/#/verify?token=${token}`;
  const delivery = await sendMail(verificationEmail({
    to: email,
    name,
    link,
    ttlHours: VERIFY_TTL,
  }));
  const devLink = delivery.delivered === 'outbox' ? link : undefined;

  return ok({ ok: true, email, verifyRequired: true, devLink }, { status: 201 });
}