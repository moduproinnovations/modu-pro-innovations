// Applies schema.sql and loads Resend secrets from ../.env into Supabase Vault.
// Usage: DATABASE_URL=postgresql://... node supabase/apply.mjs
import fs from 'node:fs';
import pg from 'pg';

const root = new URL('../', import.meta.url);
const readEnv = () =>
  Object.fromEntries(
    fs
      .readFileSync(new URL('.env', root), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])
  );

const env = readEnv();
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
console.log('schema applied');

for (const [name, value] of [
  ['resend_api_key', env.RESEND_API_KEY],
  ['resend_from', env.RESEND_FROM],
]) {
  if (!value) continue;
  const { rows } = await client.query('select id from vault.secrets where name = $1', [name]);
  if (rows.length) {
    await client.query('select vault.update_secret($1, $2)', [rows[0].id, value]);
  } else {
    await client.query('select vault.create_secret($1, $2)', [value, name]);
  }
  console.log(`vault secret set: ${name}`);
}

await client.end();
