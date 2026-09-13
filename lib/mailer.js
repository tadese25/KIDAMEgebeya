/* ============================================================
   KIDAMEgebeya — Mail transport
   Uses the Resend API when RESEND_API_KEY is configured;
   otherwise falls back to a dev outbox under data/outbox (one
   JSON per email) so the whole verify/reset flow works locally.
   The dev inbox is exposed via GET /api/dev/inbox (never in
   production).
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const outboxDir = path.join(process.cwd(), 'data', 'outbox');

const resendConfigured = !!process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || 'KIDAMEgebeya <onboarding@resend.dev>';

export async function sendMail({ to, subject, text, html }) {
  if (resendConfigured) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        text,
        html: html || text,
      });
      if (error) {
        console.warn('[mail] Resend send failed:', error.message || error);
      } else {
        console.log(`[mail:resend] ${subject} -> ${to}`);
        return { to, subject, delivered: 'resend' };
      }
    } catch (err) {
      console.warn('[mail] Resend send failed, falling back to outbox:', err.message);
    }
  }

  const record = { to, subject, text, html: html || text, at: new Date().toISOString(), delivered: 'outbox' };
  try {
    fs.mkdirSync(outboxDir, { recursive: true });
    const file = path.join(outboxDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
    fs.writeFileSync(file, JSON.stringify(record));
    console.log(`[mail:outbox] ${subject} -> ${to}`);
  } catch (err) {
    console.warn(`[mail] outbox write failed (${err.message}); continuing without delivery record`);
    return { to, subject, delivered: 'outbox', failed: true };
  }
  return record;
}

export function verificationEmail({ to, name, link, ttlHours }) {
  return {
    to,
    subject: 'Verify your KIDAMEgebeya account',
    text: `Hi ${name},\n\nPlease confirm your email address to finish setting up your KIDAMEgebeya account.\n\n${link}\n\nThis link expires in ${ttlHours} hours. If you didn't create an account, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:24px auto;border:1px solid #e5e5e5;border-radius:12px;padding:24px">
        <h2 style="margin:0 0 8px">Verify your email</h2>
        <p style="color:#555">Hi ${name},<br/>Confirm your address to activate your KIDAMEgebeya account.</p>
        <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verify email</a></p>
        <p style="color:#999;font-size:12px">This link expires in ${ttlHours} hours. If you didn't create an account, ignore this email.</p>
      </div>`,
  };
}

export function resetEmail({ to, name, link, ttlHours }) {
  return {
    to,
    subject: 'Reset your KIDAMEgebeya password',
    text: `Hi ${name},\n\nWe received a request to reset your KIDAMEgebeya password. Use the link below to choose a new one.\n\n${link}\n\nThis link expires in ${ttlHours} hours. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:24px auto;border:1px solid #e5e5e5;border-radius:12px;padding:24px">
        <h2 style="margin:0 0 8px">Reset your password</h2>
        <p style="color:#555">Hi ${name},<br/>Click below to set a new password for your KIDAMEgebeya account.</p>
        <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Choose a new password</a></p>
        <p style="color:#999;font-size:12px">This link expires in ${ttlHours} hours. If you didn't request this, you can ignore this email.</p>
      </div>`,
  };
}

export function otpEmail({ to, name, code, purpose, ttlMinutes }) {
  const verify = purpose === 'verify';
  const subject = verify ? 'Your KIDAMEgebeya verification code' : 'Your KIDAMEgebeya password reset code';
  const text = `Hi ${name},\n\nYour ${verify ? 'email verification' : 'password reset'} code is:\n\n${code}\n\nIt expires in ${ttlMinutes} minutes. If you didn't request this, you can ignore this email.`;
  const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:24px auto;border:1px solid #e5e5e5;border-radius:12px;padding:24px">
        <h2 style="margin:0 0 8px">${verify ? 'Verify your email' : 'Reset your password'}</h2>
        <p style="color:#555">Hi ${name},<br/>Your ${verify ? 'email verification' : 'password reset'} code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;margin:16px 0">${code}</p>
        <p style="color:#999;font-size:12px">This code expires in ${ttlMinutes} minutes. If you didn't request this, ignore this email.</p>
      </div>`;
  return { to, subject, text, html };
}

export function listOutbox({ email } = {}) {
  let files = [];
  try { files = fs.readdirSync(outboxDir).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const emails = [];
  for (const f of files) {
    try {
      const e = JSON.parse(fs.readFileSync(path.join(outboxDir, f), 'utf8'));
      if (!email || e.to === email) emails.push(e);
    } catch { /* skip corrupt */ }
  }
  return emails.reverse();
}