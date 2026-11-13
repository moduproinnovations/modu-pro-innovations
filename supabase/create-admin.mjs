// Creates (or updates) the admin auth user. Safe to re-run.
// Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node supabase/create-admin.mjs
import pg from 'pg';

const email = (process.env.ADMIN_EMAIL || 'admin@moduproinnovations.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error('ADMIN_PASSWORD is required');

const c = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const appMeta = JSON.stringify({ provider: 'email', providers: ['email'], role: 'admin' });
const userMeta = JSON.stringify({ full_name: 'Modu Pro Admin' });

const existing = await c.query('select id from auth.users where email = $1', [email]);

let id;
if (existing.rows.length) {
  id = existing.rows[0].id;
  await c.query(
    `update auth.users set
       encrypted_password = extensions.crypt($2, extensions.gen_salt('bf')),
       email_confirmed_at = now(),
       raw_app_meta_data = $3::jsonb,
       raw_user_meta_data = $4::jsonb,
       updated_at = now()
     where id = $1`,
    [id, password, appMeta, userMeta]
  );
  console.log('updated existing user', id);
} else {
  const res = await c.query(
    `insert into auth.users (
       instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       confirmation_token, recovery_token, email_change_token_new, email_change,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at
     ) values (
       '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       $1, extensions.crypt($2, extensions.gen_salt('bf')), now(),
       '', '', '', '',
       $3::jsonb, $4::jsonb, now(), now()
     ) returning id`,
    [email, password, appMeta, userMeta]
  );
  id = res.rows[0].id;
  console.log('created user', id);
}

await c.query(
  `insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
   values ($1::text, $2::uuid, jsonb_build_object('sub', $1::text, 'email', $3::text, 'email_verified', true), 'email', now(), now(), now())
   on conflict (provider_id, provider) do nothing`,
  [String(id), id, email]
);

const check = await c.query(
  "select email, raw_app_meta_data->>'role' as role, email_confirmed_at is not null as confirmed from auth.users where id = $1",
  [id]
);
console.log(check.rows[0]);
await c.end();
