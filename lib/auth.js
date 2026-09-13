/* ============================================================
   KIDAMEgebeya — Auth helpers: JWT httpOnly cookie, user loading, serialization
   ============================================================ */
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import db from './db.js';

export const COOKIE_NAME = 'nt';
const SECRET = process.env.JWT_SECRET || 'nova-dev-secret-change-me';
const MAX_AGE = 60 * 60 * 24 * 7;

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, SECRET, { expiresIn: '7d' });
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '12h' });
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, SECRET)?.role === 'admin';
  } catch {
    return false;
  }
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload?.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

export function readTokenFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name === COOKIE_NAME) return part.slice(idx + 1).trim();
  }
  return null;
}

export function withAuthCookie(body, token) {
  const res = NextResponse.json(body);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}

export function clearAuthCookie() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}

export function publicUser(row) {
  return row
    ? { id: row.id, name: row.name, email: row.email, createdAt: row.created_at, emailVerified: !!row.email_verified }
    : null;
}

export function requireUser(request) {
  const token = readTokenFromRequest(request);
  const userId = token ? verifyToken(token) : null;
  if (!userId) return null;
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return row && !row.disabled ? publicUser(row) : null;
}

export function currentUser(request) {
  return requireUser(request);
}

export function currentAdmin(request) {
  const token = readTokenFromRequest(request);
  return token ? verifyAdminToken(token) : false;
}

/* ------------------------ one-time email tokens ------------------------ */

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function issueToken({ userId, type, ttlHours }) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlHours * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare('INSERT INTO auth_tokens (user_id, type, token_hash, expires_at) VALUES (?,?,?,?)')
    .run(userId, type, hashToken(token), expiresAt);
  return token;
}

export function consumeToken({ token, type }) {
  const row = db.prepare(`SELECT * FROM auth_tokens
    WHERE token_hash = ? AND type = ? AND consumed = 0 AND expires_at > datetime('now')`)
    .get(hashToken(String(token || '')), type);
  if (!row) return null;
  db.prepare('UPDATE auth_tokens SET consumed = 1 WHERE id = ?').run(row.id);
  return row;
}

export function latestLiveToken({ userId, type }) {
  return db.prepare(`SELECT * FROM auth_tokens
    WHERE user_id = ? AND type = ? AND consumed = 0 AND expires_at > datetime('now')
    ORDER BY id DESC LIMIT 1`).get(userId, type);
}

/* ------------------------ OTP codes ------------------------ */

const OTP_TYPES = ['verify_otp', 'reset_otp'];

export function generateOtp(digits = 6) {
  let code = String(1 + Math.floor(Math.random() * 9));
  for (let i = 1; i < digits; i++) code += String(Math.floor(Math.random() * 10));
  return code;
}

export function issueOtp({ userId, type, ttlMinutes, digits = 6 }) {
  if (!OTP_TYPES.includes(type)) throw new Error(`Invalid OTP type: ${type}`);
  // single active code per user+type: a fresh request invalidates the old one
  db.prepare('DELETE FROM auth_tokens WHERE user_id = ? AND type = ? AND consumed = 0').run(userId, type);
  const code = generateOtp(digits);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60e3).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare('INSERT INTO auth_tokens (user_id, type, token_hash, expires_at) VALUES (?,?,?,?)')
    .run(userId, type, hashToken(code), expiresAt);
  return code;
}

export function consumeOtp({ userId, type, code, maxAttempts = 5 }) {
  const row = db.prepare(`SELECT * FROM auth_tokens
    WHERE user_id = ? AND type = ? AND consumed = 0 AND expires_at > datetime('now')
    ORDER BY id DESC LIMIT 1`).get(userId, type);
  if (!row) return null; // no live code issued
  if (hashToken(String(code || '')) !== row.token_hash) {
    const attempts = (row.attempts || 0) + 1;
    if (attempts >= maxAttempts) db.prepare('DELETE FROM auth_tokens WHERE id = ?').run(row.id);
    else db.prepare('UPDATE auth_tokens SET attempts = ? WHERE id = ?').run(attempts, row.id);
    return null;
  }
  db.prepare('UPDATE auth_tokens SET consumed = 1 WHERE id = ?').run(row.id);
  return row;
}