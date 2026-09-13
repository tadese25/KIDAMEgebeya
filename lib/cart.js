import db from './db.js';
import { toProduct } from './api.js';

export function getCartFor(userId) {
  const rows = db
    .prepare('SELECT c.product_id, c.qty, p.* FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?')
    .all(userId);
  const cart = {};
  const items = rows.map((r) => {
    cart[r.product_id] = r.qty;
    return { product: toProduct(r), qty: r.qty };
  });
  return { cart, items };
}

export function replaceCart(userId, mapping) {
  const del = db.prepare('DELETE FROM cart_items WHERE user_id = ?');
  const getProd = db.prepare('SELECT id, stock FROM products WHERE id = ?');
  const ins = db.prepare(
    'INSERT INTO cart_items (user_id, product_id, qty) VALUES (?,?,?) ON CONFLICT(user_id, product_id) DO UPDATE SET qty = excluded.qty'
  );
  const tx = db.transaction(() => {
    del.run(userId);
    for (const [id, qty] of Object.entries(mapping || {})) {
      const n = Math.floor(Number(qty));
      if (!(n > 0)) continue;
      const prod = getProd.get(id);
      if (!prod) continue;
      ins.run(userId, id, Math.min(n, prod.stock));
    }
  });
  tx();
  return getCartFor(userId);
}