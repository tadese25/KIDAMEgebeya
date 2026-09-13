/* ============================================================
   KIDAMEgebeya — SQLite persistence (better-sqlite3)
   Creates the schema and seeds the catalog on first run.
   ============================================================ */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seedData from './seed-data.json' with { type: 'json' };

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'nova.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT DEFAULT '',
      full_name TEXT DEFAULT '',
      line1 TEXT DEFAULT '',
      line2 TEXT DEFAULT '',
      city TEXT DEFAULT '',
      state TEXT DEFAULT '',
      zip TEXT DEFAULT '',
      country TEXT DEFAULT 'United States',
      phone TEXT DEFAULT '',
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT DEFAULT '',
      image TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT DEFAULT 'KIDAMEgebeya',
      price REAL NOT NULL,
      old_price REAL,
      rating REAL NOT NULL DEFAULT 0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      featured INTEGER DEFAULT 0,
      tag TEXT,
      colors TEXT NOT NULL DEFAULT '[]',
      sizes TEXT NOT NULL DEFAULT '[]',
      description TEXT DEFAULT '',
      specs TEXT NOT NULL DEFAULT '[]',
      images TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      number TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Processing',
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      shipping REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      promo_code TEXT,
      payment_method TEXT NOT NULL,
      card_last4 TEXT,
      card_brand TEXT,
      address TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      unit_price REAL NOT NULL,
      qty INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      title TEXT DEFAULT '',
      body TEXT DEFAULT '',
      author_name TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL,        -- 'percent' | 'free_shipping'
      value REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,        -- 'verify' | 'reset'
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash);
  `);

  const cols = (table) => db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols('users').includes('disabled')) db.exec('ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0');
  if (!cols('users').includes('email_verified')) {
    db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0');
    // one-time backfill so pre-existing accounts aren't locked out by the migration
    db.exec('UPDATE users SET email_verified = 1 WHERE email_verified = 0 OR email_verified IS NULL');
  }
  if (!cols('promo_codes').includes('active')) db.exec('ALTER TABLE promo_codes ADD COLUMN active INTEGER DEFAULT 1');
  if (!cols('auth_tokens').includes('attempts')) db.exec('ALTER TABLE auth_tokens ADD COLUMN attempts INTEGER DEFAULT 0');
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const hasLocalUsers = userCount > 0;
  const categoryCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
  const productCount = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;

  if (categoryCount === 0 && seedData.categories?.length) {
    const ins = db.prepare('INSERT INTO categories (id, name, tagline, image) VALUES (?,?,?,?)');
    const tx = db.transaction((rows) => {
      for (const c of rows) ins.run(c.id, c.name, c.tagline || '', c.image || '');
    });
    tx(seedData.categories);
  }

  if (productCount === 0 && seedData.products?.length) {
    const ins = db.prepare(`INSERT INTO products
      (id, name, category, brand, price, old_price, rating, reviews_count, stock, featured, tag, colors, sizes, description, specs, images)
      VALUES (@id,@name,@category,@brand,@price,@oldPrice,@rating,@reviewsCount,@stock,@featured,@tag,@colors,@sizes,@description,@specs,@images)`);
    const tx = db.transaction((rows) => {
      for (const p of rows) {
        ins.run({
          ...p,
          colors: JSON.stringify(p.colors || []),
          sizes: JSON.stringify(p.sizes || []),
          specs: JSON.stringify(p.specs || []),
          images: JSON.stringify(p.images || []),
        });
      }
    });
    tx(seedData.products);
  }

  const promoCount = db.prepare('SELECT COUNT(*) AS n FROM promo_codes').get().n;
  if (promoCount === 0) {
    const ins = db.prepare('INSERT INTO promo_codes (code, type, value) VALUES (?,?,?)');
    const tx = db.transaction(() => {
      ins.run('WELCOME10', 'percent', 0.10);
      ins.run('KIDAME15', 'percent', 0.15);
      ins.run('FREESHIP', 'free_shipping', 0);
    });
    tx();
  }

  console.log(`[db] categories=${categoryCount} products=${productCount} localUsers=${hasLocalUsers ? 'yes' : 'none'}`);
}

migrate();
seed();

export default db;