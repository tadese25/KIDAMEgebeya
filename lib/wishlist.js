import db from './db.js';

export function getWishlist(userId) {
  const rows = db
    .prepare('SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY id DESC')
    .all(userId);
  return rows.map((r) => r.product_id);
}

export function replaceWishlist(userId, ids) {
  const del = db.prepare('DELETE FROM wishlist_items WHERE user_id = ?');
  const getProd = db.prepare('SELECT id FROM products WHERE id = ?');
  const ins = db.prepare('INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?,?)');
  const tx = db.transaction(() => {
    del.run(userId);
    for (const id of ids || []) {
      if (getProd.get(id)) ins.run(userId, id);
    }
  });
  tx();
  return getWishlist(userId);
}

export function toggleWishlist(userId, productId) {
  const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(userId, productId);
  if (existing) {
    db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
  } else {
    db.prepare('INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?,?)').run(userId, productId);
  }
  return getWishlist(userId);
}