/* ============================================================
   KIDAMEgebeya — Postgres persistence (Neon serverless)
   Lazy-migrates the schema and seeds the catalog on first query.
   ============================================================ */
import { Pool } from '@neondatabase/serverless';
import seedData from './seed-data.json' with { type: 'json' };

const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function normalizeValue(v) {
  if (v instanceof Date) return v.toISOString();
  return v;
}

function normalizeRow(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = normalizeValue(v);
  }
  return out;
}

function normalizeRows(rows) {
  return rows.map(normalizeRow);
}

async function execQuery(text, params) {
  const res = await pool.query(text, params);
  return { rows: normalizeRows(res.rows || []), rowCount: res.rowCount || 0 };
}

async function exec(sql, ...params) {
  const text = toPg(sql);
  const clean = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  const mapped = clean.map(normalizeValue);
  return execQuery(text, mapped);
}

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      email_verified INTEGER DEFAULT 0,
      disabled INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
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
      price DOUBLE PRECISION NOT NULL,
      old_price DOUBLE PRECISION,
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
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
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      number TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Processing',
      subtotal DOUBLE PRECISION NOT NULL,
      discount DOUBLE PRECISION NOT NULL DEFAULT 0,
      shipping DOUBLE PRECISION NOT NULL DEFAULT 0,
      tax DOUBLE PRECISION NOT NULL DEFAULT 0,
      total DOUBLE PRECISION NOT NULL,
      promo_code TEXT,
      payment_method TEXT NOT NULL,
      card_last4 TEXT,
      card_brand TEXT,
      address TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      unit_price DOUBLE PRECISION NOT NULL,
      qty INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      title TEXT DEFAULT '',
      body TEXT DEFAULT '',
      author_name TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value DOUBLE PRECISION NOT NULL DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      attempts INTEGER DEFAULT 0
    );
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash)');
}

async function seed() {
  const { rows: [{ n: userCount }] } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  const { rows: [{ n: categoryCount }] } = await pool.query('SELECT COUNT(*)::int AS n FROM categories');
  const { rows: [{ n: productCount }] } = await pool.query('SELECT COUNT(*)::int AS n FROM products');

  if (categoryCount === 0 && seedData.categories?.length) {
    for (const c of seedData.categories) {
      await pool.query(
        'INSERT INTO categories (id, name, tagline, image) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [c.id, c.name, c.tagline || '', c.image || '']
      );
    }
  }

  if (productCount === 0 && seedData.products?.length) {
    for (const p of seedData.products) {
      await pool.query(
        `INSERT INTO products (id, name, category, brand, price, old_price, rating, reviews_count, stock, featured, tag, colors, sizes, description, specs, images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT DO NOTHING`,
        [p.id, p.name, p.category, p.brand || 'KIDAMEgebeya', p.price, p.oldPrice || null,
         p.rating, p.reviewsCount || 0, p.stock, p.featured || 0, p.tag || null,
         JSON.stringify(p.colors || []), JSON.stringify(p.sizes || []),
         p.description || '', JSON.stringify(p.specs || []), JSON.stringify(p.images || [])]
      );
    }
  }

  const { rows: [{ n: promoCount }] } = await pool.query('SELECT COUNT(*)::int AS n FROM promo_codes');
  if (promoCount === 0) {
    await pool.query("INSERT INTO promo_codes (code, type, value) VALUES ('WELCOME10','percent',0.10) ON CONFLICT DO NOTHING");
    await pool.query("INSERT INTO promo_codes (code, type, value) VALUES ('KIDAME15','percent',0.15) ON CONFLICT DO NOTHING");
    await pool.query("INSERT INTO promo_codes (code, type, value) VALUES ('FREESHIP','free_shipping',0) ON CONFLICT DO NOTHING");
  }

  console.log(`[db] categories=${categoryCount} products=${productCount} localUsers=${userCount > 0 ? 'yes' : 'none'}`);
}

let ready = null;
async function ensureReady() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required. Set it in your Vercel project settings.');
  }
  if (!ready) {
    ready = migrate().then(seed).catch((err) => {
      ready = null;
      console.error('[db] migration/seed failed:', err);
      throw err;
    });
  }
  return ready;
}

async function query(sql, ...params) {
  await ensureReady();
  return exec(sql, ...params);
}

const db = {
  async get(sql, ...params) {
    const { rows } = await query(sql, ...params);
    return rows[0];
  },

  async all(sql, ...params) {
    const { rows } = await query(sql, ...params);
    return rows;
  },

  async run(sql, ...params) {
    const { rowCount } = await query(sql, ...params);
    return { changes: rowCount };
  },

  async transaction(fn) {
    await ensureReady();
    if (!pool) throw new Error('DATABASE_URL environment variable is required.');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const txDb = makeDb({
        query: (text, params) => client.query(text, params).then(r => ({ rows: normalizeRows(r.rows || []), rowCount: r.rowCount || 0 })),
      });
      const result = await fn(txDb);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

function makeDb(executor) {
  function toPgT(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }
  return {
    async get(sql, ...params) {
      const text = toPgT(sql);
      const mapped = (params.length === 1 && Array.isArray(params[0]) ? params[0] : params).map(normalizeValue);
      const { rows } = await executor.query(text, mapped);
      return rows[0];
    },
    async all(sql, ...params) {
      const text = toPgT(sql);
      const mapped = (params.length === 1 && Array.isArray(params[0]) ? params[0] : params).map(normalizeValue);
      const { rows } = await executor.query(text, mapped);
      return rows;
    },
    async run(sql, ...params) {
      const text = toPgT(sql);
      const mapped = (params.length === 1 && Array.isArray(params[0]) ? params[0] : params).map(normalizeValue);
      const { rowCount } = await executor.query(text, mapped);
      return { changes: rowCount };
    },
  };
}

export default db;
export { pool, ensureReady, toPg };
