import { ok, fail, getPromo } from '../../../../lib/api.js';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const code = String(body.code || '');
  const promo = await getPromo(code);
  if (!promo) return ok({ valid: false });
  return ok({ valid: true, code: promo.code, type: promo.type, value: promo.value, label: promo.label });
}