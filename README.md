# Modu Pro Innovation — Website

React (Vite) marketing site plus a Supabase-backed admin panel. The browser talks
to Supabase directly; there is no Express server.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Publishable / anon key (safe in the browser) |
| `VITE_MAP_EMBED_URL` | Optional Google Maps embed URL |

`RESEND_API_KEY` and `RESEND_FROM` have no `VITE_` prefix, so they are never
bundled into the browser.

## Database

`schema.sql` is re-runnable and creates the tables, RLS policies, public read
views, the `submit_enquiry` RPC, the storage bucket policies and the Resend
notification trigger.

```bash
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres \
  node supabase/apply.mjs   # schema + Resend secrets into Vault
DATABASE_URL=... node supabase/seed.mjs   # optional: load supabase/seed-data.json
```

## Admin access

Admin access is granted through the Supabase Auth user's `app_metadata`:

```json
{ "role": "admin" }
```

Create the account (re-runnable; also resets the password):

```bash
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres \
ADMIN_EMAIL=admin@moduproinnovations.com ADMIN_PASSWORD='...' \
  node supabase/create-admin.mjs
```

Sign in at `/admin/login`. Disable public sign-ups in
**Authentication → Providers → Email** — no self-service account should ever be
able to exist.

## Enquiry email notifications

A trigger on `enquiries` posts to Resend with the key stored in Supabase Vault
(`resend_api_key`). `supabase/apply.mjs` loads it from `.env`; to change it later:

```sql
select vault.update_secret((select id from vault.secrets where name = 'resend_api_key'), 're_...');
```

The recipient is editable in **Admin → Settings**. Resend's `onboarding@resend.dev`
sender only delivers to the Resend account owner — verify a domain and set
`RESEND_FROM` (e.g. `Modu Pro <enquiries@modupro.in>`) for customer acknowledgements.

## Deploy

Deploy the repository root to Vercel as a static Vite app. Set the two
`VITE_SUPABASE_*` variables in the Vercel project. `vercel.json` rewrites all
routes to `index.html` for the React router.

## Media library

Uploads go to the public `media` Storage bucket. Only admins with the `role`
claim can write; public reads are allowed.
