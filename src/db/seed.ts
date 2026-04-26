import { pool } from './index'

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  description TEXT,
  svg_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('spice','tea')),
  region_id UUID REFERENCES regions(id),
  description TEXT,
  flavor_tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`

const regionData = [
  {
    name: 'Central Highlands',
    province: 'Central Province',
    description: 'High-altitude region encompassing Kandy and Nuwara Eliya, famous for Ceylon tea and cardamom cultivation.',
    svg_id: 'central-highlands',
  },
  {
    name: 'Southern Province',
    province: 'Southern Province',
    description: 'Coastal and inland region around Galle and Matara, home to Ceylon cinnamon and clove.',
    svg_id: 'southern-province',
  },
  {
    name: 'Sabaragamuwa',
    province: 'Sabaragamuwa Province',
    description: 'The gem-rich hills of Ratnapura, producing black pepper and nutmeg.',
    svg_id: 'sabaragamuwa',
  },
  {
    name: 'Nuwara Eliya',
    province: 'Central Province',
    description: 'The "Little England" of Sri Lanka — cool climate and misty hills ideal for delicate white and black teas.',
    svg_id: 'nuwara-eliya',
  },
]

const productData = [
  {
    name: 'Ceylon Cinnamon',
    category: 'spice',
    region: 'Southern Province',
    description:
      'Ceylon Cinnamon (Cinnamomum verum) is the true cinnamon native to Sri Lanka. Unlike cassia, it has a delicate, sweet warmth with subtle citrus notes. Hand-rolled from the inner bark of the cinnamon tree, it has been prized for over 2,000 years.',
    flavor_tags: ['Sweet', 'Delicate', 'Warm', 'Citrus'],
    image_url:
      'https://images.unsplash.com/photo-1599909631458-a5afe5a76143?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Black Pepper',
    category: 'spice',
    region: 'Sabaragamuwa',
    description:
      'Sri Lankan black pepper from the Sabaragamuwa highlands delivers a bold, earthy bite with a lingering heat. Known as the "king of spices," it was once worth its weight in gold and drove the spice trade routes to the island.',
    flavor_tags: ['Pungent', 'Earthy', 'Sharp', 'Bold'],
    image_url:
      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Cardamom',
    category: 'spice',
    region: 'Central Highlands',
    description:
      'Green cardamom from the Central Highlands is intensely aromatic — floral and citrusy with a warm spice finish. Grown under shade in misty highland forests, each pod is hand-harvested to preserve the volatile oils that give it its distinctive scent.',
    flavor_tags: ['Floral', 'Citrus', 'Spicy', 'Aromatic'],
    image_url:
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Clove',
    category: 'spice',
    region: 'Southern Province',
    description:
      'Sri Lankan cloves are dried flower buds with an intensely warm, woody aroma and powerful eugenol content. Used in everything from Ayurvedic medicine to rich curries, they were among the most coveted spices in the ancient spice trade.',
    flavor_tags: ['Intense', 'Woody', 'Warm', 'Medicinal'],
    image_url:
      'https://images.unsplash.com/photo-1599909631458-a5afe5a76143?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Nutmeg',
    category: 'spice',
    region: 'Sabaragamuwa',
    description:
      'Nutmeg from Sabaragamuwa carries a warm, nutty sweetness with a faint woody undertone. The seed and its lacy covering (mace) are both used as spices, making the nutmeg tree one of the most versatile in the spice world.',
    flavor_tags: ['Warm', 'Nutty', 'Sweet', 'Woody'],
    image_url:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Ceylon Black Tea',
    category: 'tea',
    region: 'Nuwara Eliya',
    description:
      'Ceylon Black Tea from Nuwara Eliya is full-bodied and brisk with a bright amber liquor and a malty backbone. Grown at elevations above 6,000 feet, the cool air and misty mornings create one of the world\'s most celebrated teas.',
    flavor_tags: ['Bold', 'Malty', 'Brisk', 'Bright'],
    image_url:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Ceylon Green Tea',
    category: 'tea',
    region: 'Central Highlands',
    description:
      'Ceylon Green Tea from the Central Highlands is lighter and more delicate than its black counterpart. Minimal oxidation preserves the fresh, grassy character of the leaf, resulting in a clean and refreshing cup with subtle vegetal notes.',
    flavor_tags: ['Grassy', 'Fresh', 'Light', 'Clean'],
    image_url:
      'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'White Tea',
    category: 'tea',
    region: 'Nuwara Eliya',
    description:
      'White Tea from Nuwara Eliya is the most minimal of all teas — only the finest buds are hand-plucked and sun-dried. The result is a pale, honey-tinted infusion with a floral delicacy that speaks of high elevation and careful craft.',
    flavor_tags: ['Delicate', 'Floral', 'Honey', 'Subtle'],
    image_url:
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80&auto=format&fit=crop',
  },
]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(schema)
    console.log('Schema created.')

    // Insert regions
    const regionIds: Record<string, string> = {}
    for (const r of regionData) {
      const existing = await client.query('SELECT id FROM regions WHERE name = $1', [r.name])
      if (existing.rows.length > 0) {
        regionIds[r.name] = existing.rows[0].id
      } else {
        const res = await client.query(
          'INSERT INTO regions (name, province, description, svg_id) VALUES ($1,$2,$3,$4) RETURNING id',
          [r.name, r.province, r.description, r.svg_id]
        )
        regionIds[r.name] = res.rows[0].id
      }
    }
    console.log('Regions seeded.')

    // Insert products
    for (const p of productData) {
      const regionId = regionIds[p.region]
      const existing = await client.query('SELECT id FROM products WHERE name = $1', [p.name])
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO products (name, category, region_id, description, flavor_tags, image_url) VALUES ($1,$2,$3,$4,$5,$6)',
          [p.name, p.category, regionId, p.description, p.flavor_tags, p.image_url]
        )
      }
    }
    console.log('Products seeded.')

    await client.query('COMMIT')
    console.log('Seed complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
