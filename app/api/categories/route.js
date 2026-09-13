import db from '../../../lib/db.js';
import { ok } from '../../../lib/api.js';

export async function GET() {
  const rows = await db.all('SELECT id, name, tagline, image FROM categories ORDER BY id');
  return ok({
    categories: rows.map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline || '',
      image: c.image || '',
    })),
  });
}