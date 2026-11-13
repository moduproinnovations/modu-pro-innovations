// Seeds Supabase from seed-data.json (captured from the old public API).
// Usage: DATABASE_URL=postgresql://... node supabase/seed.mjs
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const data = JSON.parse(fs.readFileSync(new URL('./seed-data.json', import.meta.url), 'utf8'));
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const strip = (o) => {
  const { _id, __v, createdAt, updatedAt, ...rest } = o;
  return rest;
};

// Arrays of strings (categories, highlights, ...) must pass through untouched;
// spreading a string into an object yields {0:'a',1:'b',...}.
const clean = (list) =>
  (list || []).map((item) => (item && typeof item === 'object' ? strip(item) : item));

await client.connect();

const ids = new Map();
for (const d of data.divisions) ids.set(d._id, randomUUID());

await client.query('begin');
await client.query('delete from enquiries');
await client.query('delete from products');
await client.query('delete from services');
await client.query('delete from industries');
await client.query('delete from divisions');
await client.query('delete from site_settings');

for (const d of data.divisions) {
  const row = strip(d);
  await client.query(
    `insert into divisions (id, name, slug, code, subtitle, "brandSpellingNote", "shortDescription",
      "fullDescription", "heroImage", "coverImage", categories, applications, "serviceHighlights",
      faqs, "displayOrder", "publicationStatus", "isArchived", seo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [
      ids.get(d._id), row.name, row.slug, row.code, row.subtitle, row.brandSpellingNote,
      row.shortDescription, row.fullDescription, row.heroImage, row.coverImage,
      JSON.stringify(clean(row.categories)), JSON.stringify(clean(row.applications)),
      JSON.stringify(clean(row.serviceHighlights)), JSON.stringify(clean(row.faqs)),
      row.displayOrder, row.publicationStatus, row.isArchived, JSON.stringify(row.seo || {}),
    ]
  );
}

for (const p of data.products) {
  const row = strip(p);
  await client.query(
    `insert into products (id, name, slug, division, category, "shortDescription", "fullDescription",
      images, specifications, applications, highlights, "isFeatured", "publicationStatus",
      "isArchived", "displayOrder", seo)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [
      randomUUID(), row.name, row.slug, ids.get(p.division._id), row.category,
      row.shortDescription, row.fullDescription, JSON.stringify(clean(row.images)),
      JSON.stringify(clean(row.specifications)), JSON.stringify(clean(row.applications)),
      JSON.stringify(clean(row.highlights)), row.isFeatured, row.publicationStatus,
      row.isArchived, row.displayOrder, JSON.stringify(row.seo || {}),
    ]
  );
}

for (const s of data.services) {
  const row = strip(s);
  await client.query(
    `insert into services (id, name, slug, category, "shortDescription", description, image,
      "scopeItems", "relatedDivisions", "confirmationStatus", "publicationStatus", "displayOrder")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      randomUUID(), row.name, row.slug, row.category, row.shortDescription, row.description,
      row.image, JSON.stringify(clean(row.scopeItems)),
      JSON.stringify((row.relatedDivisions || []).map((d) => ids.get(d._id))),
      row.confirmationStatus, row.publicationStatus, row.displayOrder,
    ]
  );
}

for (const i of data.industries) {
  const row = strip(i);
  await client.query(
    `insert into industries (id, name, slug, "shortDescription", description, image,
      "keyApplications", "relatedDivisions", "publicationStatus", "displayOrder")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      randomUUID(), row.name, row.slug, row.shortDescription, row.description, row.image,
      JSON.stringify(clean(row.keyApplications)),
      JSON.stringify((row.relatedDivisions || []).map((d) => ids.get(d._id))),
      row.publicationStatus, row.displayOrder,
    ]
  );
}

const s = strip(data.settings);
await client.query('insert into site_settings (data, notification) values ($1,$2)', [
  JSON.stringify(s),
  JSON.stringify({
    enquiryRecipientEmail: 'moduproinnovations2805@gmail.com',
    sendCustomerAcknowledgement: true,
  }),
]);

await client.query('commit');

for (const t of ['divisions', 'products', 'services', 'industries', 'site_settings']) {
  const { rows } = await client.query(`select count(*)::int as n from ${t}`);
  console.log(t, rows[0].n);
}

await client.end();
