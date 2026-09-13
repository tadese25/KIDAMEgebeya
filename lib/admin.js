/* ============================================================
   KIDAMEgebeya — Admin helpers: auth guard, serialization, analytics
   ============================================================ */
import db from './db.js';
import { currentAdmin } from './auth.js';
import { toProduct, isoDate } from './api.js';

export const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function requireAdmin(request) {
  return currentAdmin(request);
}

export function adminOrder(row, items) {
  let address = null;
  try {
    const a = JSON.parse(row.address || '{}');
    address = { line1: a.address, city: a.city, state: a.state, zip: a.zip, country: a.country };
  } catch { /* raw fallback */ }
  return {
    id: row.number,
    date: isoDate(row.created_at),
    status: row.status,
    email: row.email,
    name: row.name,
    totals: { subtotal: row.subtotal, discount: row.discount, shipping: row.shipping, tax: row.tax, total: row.total },
    promoCode: row.promo_code,
    payment: row.payment_method,
    cardLast4: row.card_last4,
    cardBrand: row.card_brand,
    itemCount: items.reduce((s, i) => s + i.qty, 0),
    address,
    items: items.map((i) => ({
      id: i.product_id,
      name: i.product_name,
      image: i.product_image,
      price: i.unit_price,
      qty: i.qty,
    })),
  };
}

export async function loadAdminOrder(number) {
  const row = await db.get('SELECT * FROM orders WHERE number = ?', number);
  if (!row) return null;
  const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', row.id);
  return { row, items, order: adminOrder(row, items) };
}

export async function overview() {
  const totalRevenue = (await db.get("SELECT COALESCE(SUM(total), 0)::float AS n FROM orders WHERE status != 'Cancelled'")).n;

  const revenueToday = (await db.get(`SELECT COALESCE(SUM(total), 0)::float AS n FROM orders WHERE status != 'Cancelled' AND created_at::date = CURRENT_DATE`)).n;
  const statusRows = await db.all('SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status');
  const statusBreakdown = Object.fromEntries(statusRows.map((r) => [r.status, r.n]));

  const topProducts = (await db.all(`
    SELECT oi.product_id AS id, MAX(oi.product_name) AS name, SUM(oi.qty)::int AS sold, SUM(oi.unit_price * oi.qty)::float AS revenue
    FROM order_items oi
    GROUP BY oi.product_id
    ORDER BY sold DESC
    LIMIT 5
  `)).map((r) => ({ id: r.id, name: r.name, sold: r.sold, revenue: r.revenue }));

  const recentOrders = (await db.all('SELECT * FROM orders ORDER BY id DESC LIMIT 6')).map((row) => ({
    id: row.number,
    date: isoDate(row.created_at),
    status: row.status,
    email: row.email,
    total: row.total,
  }));

  const lowStock = (await db.get('SELECT COUNT(*)::int AS n FROM products WHERE stock < 10')).n;
  const orders = (await db.get('SELECT COUNT(*)::int AS n FROM orders')).n;
  const ordersToday = (await db.get('SELECT COUNT(*)::int AS n FROM orders WHERE created_at::date = CURRENT_DATE')).n;
  const products = (await db.get('SELECT COUNT(*)::int AS n FROM products')).n;
  const users = (await db.get('SELECT COUNT(*)::int AS n FROM users WHERE disabled = 0')).n;
  const promos = (await db.get('SELECT COUNT(*)::int AS n FROM promo_codes WHERE active = 1')).n;

  return {
    revenue: Math.round(totalRevenue * 100) / 100,
    revenueToday: Math.round(revenueToday * 100) / 100,
    orders,
    pendingOrders: statusBreakdown.Processing || 0,
    ordersToday,
    statusBreakdown,
    products,
    lowStock,
    users,
    promos,
    topProducts,
    recentOrders,
  };
}