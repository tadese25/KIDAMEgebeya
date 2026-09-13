import db from '../../../lib/db.js';
import { ok, toProduct } from '../../../lib/api.js';

const SORTS = {
  'price-asc': 'p.price ASC',
  'price-desc': 'p.price DESC',
  rating: 'p.rating DESC',
  newest: 'p.id ASC',
  name: 'p.name ASC',
  popular: 'p.reviews_count DESC',
};

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const args = [];
  const where = [];
  let sql = 'SELECT * FROM products p';

  const q = (params.get('q') || '').trim();
  if (q) {
    where.push('(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)');
    args.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
  }
  const category = (params.get('category') || '').trim();
  if (category) {
    where.push('p.category = ?');
    args.push(category);
  }
  const maxPrice = Number(params.get('maxPrice'));
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    where.push('p.price <= ?');
    args.push(maxPrice);
  }
  const minRating = Number(params.get('minRating'));
  if (Number.isFinite(minRating) && minRating > 0) {
    where.push('p.rating >= ?');
    args.push(minRating);
  }
  if (params.get('inStock') === 'true') where.push('p.stock > 0');
  if (params.get('tag')) {
    where.push('p.tag = ?');
    args.push(params.get('tag'));
  }
  if (params.get('featured') === 'true') where.push('p.featured = 1');

  if (where.length) sql += ' WHERE ' + where.join(' AND ');

  const sort = SORTS[params.get('sort')] || SORTS.popular;
  sql += ' ORDER BY ' + sort;
  if (params.get('sort') !== 'newest' && params.get('sort') !== 'name') {
    sql += ', p.featured DESC, p.rating DESC';
  }

  const rows = db.prepare(sql).all(...args);
  return ok({ products: rows.map(toProduct), total: rows.length });
}