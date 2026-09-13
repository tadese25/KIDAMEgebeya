import db from './db.js';

export async function getWishlist(userId) {
  const rows = await db.all(
    'SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY id DESC',
    userId
  );
  return rows.map((r) => r.product_id);
}

export async function replaceWishlist(userId, ids) {
  await db.transaction(async (t) => {
    await t.run('DELETE FROM wishlist_items WHERE user_id = ?', userId);
    for (const id of ids || []) {
      const prod = await t.get('SELECT id FROM products WHERE id = ?', id);
      if (prod) {
        await t.run(
          'INSERT INTO wishlist_items (user_id, product_id) VALUES (?,?) ON CONFLICT DO NOTHING',
          userId, id
        );
      }
    }
  });
  return getWishlist(userId);
}

export async function toggleWishlist(userId, productId) {
  const existing = await db.get('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?', userId, productId);
  if (existing) {
    await db.run('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', userId, productId);
  } else {
    await db.run(
      'INSERT INTO wishlist_items (user_id, product_id) VALUES (?,?) ON CONFLICT DO NOTHING',
      userId, productId
    );
  }
  return getWishlist(userId);
}