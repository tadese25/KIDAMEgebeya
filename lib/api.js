/* ============================================================
   KIDAMEgebeya — Shared helpers: product serialization, pricing math, API responses
   ============================================================ */
import { NextResponse } from 'next/server';
import db from './db.js';

export function ok(body, init = {}) {
  return NextResponse.json(body, init);
}

export function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function parseJson(field) {
  try {
    return JSON.parse(field || '[]');
  } catch {
    return [];
  }
}

export function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: row.price,
    oldPrice: row.old_price,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    stock: row.stock,
    featured: !!row.featured,
    tag: row.tag,
    colors: parseJson(row.colors),
    sizes: parseJson(row.sizes),
    description: row.description,
    specs: parseJson(row.specs),
    images: parseJson(row.images),
  };
}

export function toAddress(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country,
    phone: row.phone,
    isDefault: !!row.is_default,
  };
}

export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 9.99;
export const TAX_RATE = 0.08;

export function getPromo(code) {
  const row = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1').get(String(code || '').trim().toUpperCase());
  if (!row) return null;
  return {
    code: row.code,
    type: row.type,
    value: row.value,
    rate: row.type === 'percent' ? row.value : 0,
    freeShipping: row.type === 'free_shipping',
    label:
      row.type === 'free_shipping'
        ? 'Free shipping'
        : `${Math.round(row.value * 100)}% off`,
  };
}

export function computeTotals(items, promoCode) {
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const promo = promoCode ? getPromo(promoCode) : null;
  const discount = subtotal > 0 && promo?.type === 'percent' ? subtotal * promo.value : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    subtotal === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD || promo?.freeShipping
      ? 0
      : SHIPPING_FLAT;
  const tax = afterDiscount * TAX_RATE;
  const total = Math.max(0, afterDiscount + shipping + tax);
  return { subtotal, discount, shipping, tax, total, promo };
}