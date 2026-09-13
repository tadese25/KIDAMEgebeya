import { toProduct } from './api.js';
import db from './db.js';

export async function getCartFor(userId) {
  const rows = await db.all(
    'SELECT c.product_id, c.qty, p.* FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?',
    userId
  );
  const cart = {};
  const items = rows.map((r) => {
    cart[r.product_id] = r.qty;
    return { product: toProduct(r), qty: r.qty };
  });
  return { cart, items };
}

export async function replaceCart(userId, mapping) {
  await db.transaction(async (t) => {
    await t.run('DELETE FROM cart_items WHERE user_id = ?', userId);
    for (const [id, qty] of Object.entries(mapping || {})) {
      const n = Math.floor(Number(qty));
      if (!(n > 0)) continue;
      const prod = await t.get('SELECT id, stock FROM products WHERE id = ?', id);
      if (!prod) continue;
      await t.run(
        'INSERT INTO cart_items (user_id, product_id, qty) VALUES (?,?,?) ON CONFLICT(user_id, product_id) DO UPDATE SET qty = excluded.qty',
        userId, id, Math.min(n, prod.stock)
      );
    }
  });
  return getCartFor(userId);
}