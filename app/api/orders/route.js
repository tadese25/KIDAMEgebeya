import db from '../../../lib/db.js';
import { ok, fail, computeTotals } from '../../../lib/api.js';
import { currentUser } from '../../../lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function orderNumber() {
  return 'NV-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function estimateDelivery(from) {
  const d = new Date(Date.parse(from) + 5 * 86400000);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function serializeOrder(row, items) {
  const { subtotal, discount, shipping, tax, total } = {
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    tax: row.tax,
    total: row.total,
  };
  const after = subtotal - discount;
  return {
    id: row.number,
    date: row.created_at.replace(' ', 'T') + 'Z',
    status: row.status,
    items: items.map((i) => ({
      id: i.product_id,
      name: i.product_name,
      price: i.unit_price,
      qty: i.qty,
      image: i.product_image,
    })),
    totals: {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      freeShippingEligible: subtotal > 0 && after >= 75,
      freeShippingRemaining: Math.max(0, 75 - after),
    },
    subtotalBeforeDiscount: subtotal,
    address: fmtAddress(row.address),
    payment: row.payment_method,
    email: row.email,
    name: row.name,
    promo: row.promo_code ? row.promo_code + (row.discount ? ' applied' : ' (free shipping)') : null,
    estimatedDelivery: estimateDelivery(row.created_at),
  };
}

function fmtAddress(json) {
  try {
    const a = JSON.parse(json);
    return [a.address, [a.city, a.state, a.zip].filter(Boolean).join(' '), a.country].filter(Boolean).join(', ');
  } catch {
    return json;
  }
}

export function loadOrder(number) {
  const row = db.prepare('SELECT * FROM orders WHERE number = ?').get(number);
  if (!row) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
  return { row, items, order: serializeOrder(row, items) };
}

export async function POST(request) {
  const user = currentUser(request);

  let body;
  try { body = await request.json(); } catch { return fail('Invalid JSON body.'); }

  const email = String(body.email || '').trim().toLowerCase();
  const method = String(body.payment || '');
  const itemsInput = Array.isArray(body.items) ? body.items : [];

  if (!EMAIL_RE.test(email)) return fail('A valid email is required to place an order.');
  if (!['card', 'paypal', 'cod'].includes(method)) return fail('Please choose a payment method.');
  if (!itemsInput.length) return fail('Your cart is empty.');

  const promo = body.promo ? String(body.promo).toUpperCase() : null;
  if (promo) {
    const promoRow = db.prepare('SELECT code FROM promo_codes WHERE code = ? AND active = 1').get(promo);
    if (!promoRow) return fail('That promo code is not valid.');
  }

  let cardLast4 = null;
  let cardBrand = body.card?.brand || null;
  if (method === 'card') {
    cardLast4 = String(body.card?.last4 || '');
    if (!/^\d{4}$/.test(cardLast4)) return fail('Card payment requires a valid card number.');
  }

  const getProduct = db.prepare('SELECT id, name, price, images FROM products WHERE id = ?');
  const orderItems = [];
  for (const it of itemsInput) {
    const id = String(it.productId || '');
    const qty = Math.floor(Number(it.qty));
    if (!id || !(qty > 0)) continue;
    const p = getProduct.get(id);
    if (!p) return fail(`Product not found: ${id}`);
    let images = [];
    try { images = JSON.parse(p.images || '[]'); } catch {}
    orderItems.push({
      product_id: id,
      product_name: p.name,
      product_image: images[0] || null,
      unit_price: p.price,
      qty,
    });
  }
  if (!orderItems.length) return fail('Your cart is empty.');

  const totals = computeTotals(orderItems, promo);
  const number = orderNumber();
  const name = String(body.name || '').trim() || email.split('@')[0];
  const address = JSON.stringify(body.address && typeof body.address === 'object' ? body.address : { address: String(body.address || '') });

  const created = new Date();

  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, number, email, name, status, subtotal, discount, shipping, tax, total, promo_code, payment_method, card_last4, card_brand, address, created_at)
    VALUES (@user_id, @number, @email, @name, 'Processing', @subtotal, @discount, @shipping, @tax, @total, @promo_code, @payment_method, @card_last4, @card_brand, @address, @created_at)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, unit_price, qty)
    VALUES (?,?,?,?,?,?)
  `);

  const tx = db.transaction(() => {
    const info = insertOrder.run({
      user_id: user?.id || null,
      number,
      email,
      name,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      promo_code: totals.promo?.code || null,
      payment_method: method,
      card_last4: cardLast4,
      card_brand: cardBrand,
      address,
      created_at: created.toISOString().slice(0, 19).replace('T', ' '),
    });
    for (const it of orderItems) insertItem.run(info.lastInsertRowid, it.product_id, it.product_name, it.product_image, it.unit_price, it.qty);
    if (user) db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);
  });
  tx();

  const { order } = loadOrder(number);
  return ok({ order }, { status: 201 });
}

export async function GET(request) {
  const user = currentUser(request);
  if (!user) return fail('Authentication required.', 401);

  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(user.id);
  const orders = rows.map((row) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
    return serializeOrder(row, items);
  });
  return ok({ orders });
}