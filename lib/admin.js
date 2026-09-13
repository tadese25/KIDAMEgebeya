/* ============================================================
   KIDAMEgebeya — Admin helpers: auth guard, serialization, analytics
   ============================================================ */
import db from './db.js';
import { currentAdmin } from './auth.js';
import { toProduct } from './api.js';

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
    date: row.created_at.replace(' ', 'T') + 'Z',
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

export function loadAdminOrder(number) {
  const row = db.prepare('SELECT * FROM orders WHERE number = ?').get(number);
  if (!row) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
  return { row, items, order: adminOrder(row, items) };
}

export function overview() {
  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status != 'Cancelled'`).get().n;
  const revenueToday = db.prepare(`SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status != 'Cancelled' AND date(created_at) = date('now')`).get().n;
  const statusCounts = db.prepare('SELECT status, COUNT(*) AS n FROM orders GROUP BY status').all();
  const statusBreakdown = Object.fromEntries(statusCounts.map((r) => [r.status, r.n]));

  const topProducts = db.prepare(`
    SELECT oi.product_id AS id, MAX(oi.product_name) AS name, SUM(oi.qty) AS sold, SUM(oi.unit_price * oi.qty) AS revenue
    FROM order_items oi
    GROUP BY oi.product_id
    ORDER BY sold DESC
    LIMIT 5
  `).all().map((r) => ({ id: r.id, name: r.name, sold: r.sold, revenue: r.revenue }));

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 6').all().map((row) => ({
    id: row.number,
    date: row.created_at.replace(' ', 'T') + 'Z',
    status: row.status,
    email: row.email,
    total: row.total,
  }));

  const lowStock = db.prepare("SELECT COUNT(*) AS n FROM products WHERE stock < 10").get().n;

  return {
    revenue: Math.round(totalRevenue * 100) / 100,
    revenueToday: Math.round(revenueToday * 100) / 100,
    orders: db.prepare('SELECT COUNT(*) AS n FROM orders').get().n,
    pendingOrders: statusBreakdown.Processing || 0,
    ordersToday: db.prepare("SELECT COUNT(*) AS n FROM orders WHERE date(created_at) = date('now')").get().n,
    statusBreakdown,
    products: db.prepare('SELECT COUNT(*) AS n FROM products').get().n,
    lowStock,
    users: db.prepare('SELECT COUNT(*) AS n FROM users WHERE disabled = 0').get().n,
    promos: db.prepare('SELECT COUNT(*) AS n FROM promo_codes WHERE active = 1').get().n,
    topProducts,
    recentOrders,
  };
}