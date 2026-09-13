/* Generates lib/seed-data.json from public/js/data.js (single source of truth). */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, 'public/js/data.js'), 'utf8');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  src + '\n;this.__novaseed__ = { CATEGORIES, PRODUCTS, TESTIMONIALS, REVIEW_AUTHORS };',
  sandbox
);

const { CATEGORIES, PRODUCTS, TESTIMONIALS, REVIEW_AUTHORS } = sandbox.__novaseed__;
if (!Array.isArray(PRODUCTS) || !Array.isArray(CATEGORIES)) {
  console.error('data.js did not expose PRODUCTS/CATEGORIES');
  process.exit(1);
}

const payload = {
  generatedAt: new Date().toISOString(),
  categories: CATEGORIES,
  products: PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand || 'NOVA',
    price: p.price,
    oldPrice: p.oldPrice || null,
    rating: p.rating,
    reviewsCount: p.reviewsCount || p.reviewCount || 0,
    stock: p.stock,
    featured: p.featured ? 1 : 0,
    tag: p.tag || null,
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    description: p.description || '',
    specs: Array.isArray(p.specs) ? p.specs : [],
    images: Array.isArray(p.images) ? p.images : [],
  })),
  testimonials: Array.isArray(TESTIMONIALS) ? TESTIMONIALS : [],
  reviewAuthors: Array.isArray(REVIEW_AUTHORS) ? REVIEW_AUTHORS : [],
};

writeFileSync(path.join(root, 'lib/seed-data.json'), JSON.stringify(payload, null, 2));
console.log(`seeded catalog: ${payload.products.length} products, ${payload.categories.length} categories`);