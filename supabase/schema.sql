-- Modu Pro Innovation — Supabase schema
-- Run once in the Supabase SQL editor (or `psql "$DATABASE_URL" -f schema.sql`).
-- Re-runnable: every object is created with IF NOT EXISTS / OR REPLACE.

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  code text not null default '01',
  subtitle text not null default '',
  "brandSpellingNote" text not null default '',
  "shortDescription" text not null,
  "fullDescription" text not null,
  "heroImage" text not null default '',
  "coverImage" text not null default '',
  categories jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  "serviceHighlights" jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  "displayOrder" integer not null default 0,
  "publicationStatus" text not null default 'published'
    check ("publicationStatus" in ('published', 'draft', 'archived')),
  "isArchived" boolean not null default false,
  seo jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  division uuid not null references divisions (id) on delete restrict,
  category text not null,
  "shortDescription" text not null,
  "fullDescription" text not null default '',
  images jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  "isFeatured" boolean not null default false,
  "publicationStatus" text not null default 'published'
    check ("publicationStatus" in ('published', 'draft', 'pending_review', 'archived')),
  "isArchived" boolean not null default false,
  "displayOrder" integer not null default 0,
  seo jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'Machinery & Technical Support',
  "shortDescription" text not null,
  description text not null,
  image text not null default '',
  "scopeItems" jsonb not null default '[]'::jsonb,
  "relatedDivisions" jsonb not null default '[]'::jsonb,
  "confirmationStatus" text not null default 'pending_confirmation'
    check ("confirmationStatus" in ('confirmed', 'pending_confirmation')),
  "publicationStatus" text not null default 'published'
    check ("publicationStatus" in ('published', 'draft', 'archived')),
  "displayOrder" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists industries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "shortDescription" text not null,
  description text not null,
  image text not null default '',
  "keyApplications" jsonb not null default '[]'::jsonb,
  "relatedDivisions" jsonb not null default '[]'::jsonb,
  "publicationStatus" text not null default 'published'
    check ("publicationStatus" in ('published', 'draft', 'archived')),
  "displayOrder" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  "fullName" text not null,
  "companyName" text not null,
  phone text not null,
  email text not null,
  "enquiryType" text not null default 'general'
    check ("enquiryType" in ('general', 'division', 'service', 'product')),
  division uuid references divisions (id) on delete restrict,
  "divisionName" text not null default 'General / Multi-Division',
  "serviceCategory" text not null default '',
  "machineOrProductDetails" text not null default '',
  message text not null,
  status text not null default 'New'
    check (status in ('New', 'In Progress', 'Responded', 'Closed')),
  "assignedTo" text not null default '',
  "internalNotes" jsonb not null default '[]'::jsonb,
  "statusHistory" jsonb not null default '[]'::jsonb,
  "sourcePage" text not null default '/contact',
  "consentAccepted" boolean not null default true,
  "consentTimestamp" timestamptz not null default now(),
  "fingerprintHash" text,
  "isArchived" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  "altText" text not null default '',
  url text not null,
  "publicId" text not null default '',
  "storageProvider" text not null default 'supabase',
  "mimeType" text not null default 'image/png',
  "sizeBytes" bigint not null default 0,
  category text not null default 'product'
    check (category in ('logo', 'division', 'product', 'service', 'industry', 'general')),
  "uploadedBy" text not null default 'System',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  "entityType" text not null,
  "entityId" text not null default '',
  summary text not null,
  "performedBy" text not null default 'Admin',
  "ipAddress" text not null default '',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- One row only; the API seam merges `data` + `notification` back together.
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}'::jsonb,
  notification jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists site_settings_singleton on site_settings ((true));

-- ============================================================
-- updatedAt trigger
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['divisions', 'products', 'services', 'industries', 'enquiries', 'media', 'audit_logs', 'site_settings'] loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists divisions_status_order on divisions ("publicationStatus", "displayOrder");
create index if not exists products_division on products (division);
create index if not exists products_status_order on products ("publicationStatus", "displayOrder");
create index if not exists products_category on products (category);
create index if not exists products_featured on products ("isFeatured");
create index if not exists services_status_order on services ("publicationStatus", "displayOrder");
create index if not exists industries_status_order on industries ("publicationStatus", "displayOrder");
create index if not exists enquiries_status on enquiries (status);
create index if not exists enquiries_created on enquiries ("createdAt" desc);
create index if not exists enquiries_division on enquiries (division);
create index if not exists enquiries_fingerprint on enquiries ("fingerprintHash", "createdAt");
create index if not exists media_category on media (category, "createdAt" desc);
create index if not exists audit_logs_created on audit_logs ("createdAt" desc);

-- ============================================================
-- Access control
-- ============================================================

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

alter table divisions enable row level security;
alter table products enable row level security;
alter table services enable row level security;
alter table industries enable row level security;
alter table enquiries enable row level security;
alter table media enable row level security;
alter table audit_logs enable row level security;
alter table site_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['divisions', 'products', 'services', 'industries', 'enquiries', 'media', 'audit_logs', 'site_settings'] loop
    execute format('drop policy if exists admin_all on %I', t);
    execute format(
      'create policy admin_all on %I for all to authenticated using (is_admin()) with check (is_admin())',
      t
    );
  end loop;
end $$;

revoke all on divisions, products, services, industries, enquiries, media, audit_logs, site_settings from anon;
grant select, insert, update, delete on divisions, products, services, industries, enquiries, media, audit_logs, site_settings to authenticated;

-- ============================================================
-- Public read views (owner-rights: they bypass RLS and filter explicitly)
-- ============================================================

create or replace view public_site_settings as
select id, data, "createdAt", "updatedAt"
from site_settings;

create or replace view public_divisions as
select
  d.id, d.name, d.slug, d.code, d.subtitle, d."brandSpellingNote",
  d."shortDescription", d."fullDescription", d."heroImage", d."coverImage",
  d.categories, d.applications, d."serviceHighlights",
  coalesce((
    select jsonb_agg(f order by o)
    from jsonb_array_elements(d.faqs) with ordinality as t(f, o)
    where f ->> 'isApproved' = 'true'
  ), '[]'::jsonb) as faqs,
  d."displayOrder", d."publicationStatus", d."isArchived", d.seo,
  d."createdAt", d."updatedAt"
from divisions d
where d."publicationStatus" = 'published'
  and d."isArchived" is not true;

create or replace view public_products as
select
  p.id, p.name, p.slug,
  jsonb_build_object(
    'id', d.id,
    'name', d.name,
    'slug', d.slug,
    'code', d.code,
    'shortDescription', d."shortDescription"
  ) as division,
  p.category, p."shortDescription", p."fullDescription", p.images,
  coalesce((
    select jsonb_agg(s order by o)
    from jsonb_array_elements(p.specifications) with ordinality as t(s, o)
    where s ->> 'isVerified' = 'true'
  ), '[]'::jsonb) as specifications,
  p.applications, p.highlights, p."isFeatured", p."publicationStatus", p."isArchived",
  p."displayOrder", p.seo, p."createdAt", p."updatedAt"
from products p
join divisions d on d.id = p.division
where p."publicationStatus" = 'published'
  and p."isArchived" is not true
  and d."publicationStatus" = 'published'
  and d."isArchived" is not true;

create or replace view public_services as
select
  s.id, s.name, s.slug, s.category, s."shortDescription", s.description, s.image,
  s."scopeItems",
  coalesce((
    select jsonb_agg(
      jsonb_build_object('id', d.id, 'name', d.name, 'slug', d.slug, 'code', d.code)
      order by r.ord
    )
    from jsonb_array_elements_text(s."relatedDivisions") with ordinality as r(div_id, ord)
    join divisions d on d.id::text = r.div_id
  ), '[]'::jsonb) as "relatedDivisions",
  s."confirmationStatus", s."publicationStatus", s."displayOrder", s."createdAt", s."updatedAt"
from services s
where s."publicationStatus" = 'published';

create or replace view public_industries as
select
  i.id, i.name, i.slug, i."shortDescription", i.description, i.image, i."keyApplications",
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', d.id, 'name', d.name, 'slug', d.slug, 'code', d.code,
        'shortDescription', d."shortDescription"
      )
      order by r.ord
    )
    from jsonb_array_elements_text(i."relatedDivisions") with ordinality as r(div_id, ord)
    join divisions d on d.id::text = r.div_id
  ), '[]'::jsonb) as "relatedDivisions",
  i."publicationStatus", i."displayOrder", i."createdAt", i."updatedAt"
from industries i
where i."publicationStatus" = 'published';

grant select on public_site_settings, public_divisions, public_products, public_services, public_industries
  to anon, authenticated;

-- ============================================================
-- Anonymous enquiry submission
-- Returns the same {success, message, data} envelope as the old API so the
-- client seam can keep its error/result handling unchanged.
-- ============================================================

create or replace function submit_enquiry(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_errors text[] := '{}';
  v_full_name text := btrim(coalesce(payload ->> 'fullName', ''));
  v_company text := btrim(coalesce(payload ->> 'companyName', ''));
  v_phone text := btrim(coalesce(payload ->> 'phone', ''));
  v_email text := lower(btrim(coalesce(payload ->> 'email', '')));
  v_message text := btrim(coalesce(payload ->> 'message', ''));
  v_type text := coalesce(nullif(btrim(coalesce(payload ->> 'enquiryType', '')), ''), 'general');
  v_service text := btrim(coalesce(payload ->> 'serviceCategory', ''));
  v_details text := btrim(coalesce(payload ->> 'machineOrProductDetails', ''));
  v_source text := coalesce(nullif(btrim(coalesce(payload ->> 'sourcePage', '')), ''), '/contact');
  v_division divisions%rowtype;
  v_division_id uuid;
  v_division_name text := coalesce(nullif(btrim(coalesce(payload ->> 'divisionName', '')), ''), 'General / Multi-Division');
  v_fingerprint text;
  v_duplicate enquiries%rowtype;
  v_reference text;
  v_row enquiries%rowtype;
  v_attempt integer := 0;
begin
  if coalesce(payload ->> 'websiteHoneypot', '') <> '' then
    return jsonb_build_object('success', false, 'message', 'Invalid submission detected.');
  end if;

  if length(v_full_name) < 2 then
    v_errors := array_append(v_errors, 'Please enter your full name (at least 2 characters).');
  end if;
  if length(v_company) < 2 then
    v_errors := array_append(v_errors, 'Please enter your company or business name.');
  end if;
  if v_phone !~ '^[+\d\s\-()]{7,20}$' then
    v_errors := array_append(v_errors, 'Please enter a valid contact phone number.');
  end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    v_errors := array_append(v_errors, 'Please enter a valid business email address.');
  end if;
  if length(v_message) < 10 then
    v_errors := array_append(v_errors, 'Please describe your requirement (at least 10 characters).');
  end if;
  if coalesce(payload ->> 'consentAccepted', 'true') in ('false', '0') then
    v_errors := array_append(v_errors, 'Please accept the privacy notice to submit your enquiry.');
  end if;

  if array_length(v_errors, 1) is not null then
    return jsonb_build_object(
      'success', false,
      'message', v_errors[1],
      'errors', to_jsonb(v_errors)
    );
  end if;

  if coalesce(payload ->> 'divisionId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into v_division from divisions where id = (payload ->> 'divisionId')::uuid;
  elsif coalesce(payload ->> 'divisionSlug', '') <> '' then
    select * into v_division from divisions where slug = lower(payload ->> 'divisionSlug');
  end if;

  if v_division.id is not null then
    v_division_id := v_division.id;
    v_division_name := v_division.name;
  end if;

  v_fingerprint := encode(digest(v_email || '|' || v_division_name || '|' || v_message, 'sha256'), 'hex');

  select * into v_duplicate
  from enquiries
  where "fingerprintHash" = v_fingerprint
    and "createdAt" >= now() - interval '2 minutes'
  order by "createdAt" desc
  limit 1;

  if v_duplicate.id is not null then
    return jsonb_build_object(
      'success', false,
      'message', 'This enquiry was already received moments ago under reference ' || v_duplicate.reference || '.',
      'data', jsonb_build_object('reference', v_duplicate.reference)
    );
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_reference := 'MP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
    exit when not exists (select 1 from enquiries where reference = v_reference);
    exit when v_attempt >= 5;
  end loop;

  insert into enquiries (
    reference, "fullName", "companyName", phone, email, "enquiryType", division,
    "divisionName", "serviceCategory", "machineOrProductDetails", message, status,
    "statusHistory", "sourcePage", "consentAccepted", "consentTimestamp", "fingerprintHash"
  ) values (
    v_reference, v_full_name, v_company, v_phone, v_email, v_type, v_division_id,
    v_division_name, v_service, v_details, v_message, 'New',
    jsonb_build_array(jsonb_build_object(
      'status', 'New',
      'changedBy', 'Public Website Submission',
      'note', 'Submitted via ' || v_source,
      'changedAt', now()
    )),
    v_source, true, now(), v_fingerprint
  )
  returning * into v_row;

  return jsonb_build_object(
    'success', true,
    'message', 'Thank you. Your enquiry has been recorded under reference ' || v_row.reference || '.',
    'data', jsonb_build_object(
      'reference', v_row.reference,
      'fullName', v_row."fullName",
      'companyName', v_row."companyName",
      'divisionName', v_row."divisionName",
      'createdAt', v_row."createdAt"
    )
  );
end;
$$;

grant execute on function submit_enquiry(jsonb) to anon, authenticated;

-- ============================================================
-- New-enquiry email notifications via Resend
-- Sends from the database so there is no separate server to deploy.
-- Secrets live in Supabase Vault: `resend_api_key` (required) and
-- `resend_from` (optional; defaults to Resend's test sender).
-- ============================================================

create extension if not exists pg_net with schema extensions;

create or replace function notify_enquiry()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
  v_from text;
  v_notification jsonb;
  v_recipient text;
  v_body text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'resend_api_key';
  if v_key is null then
    return new;
  end if;
  select decrypted_secret into v_from from vault.decrypted_secrets where name = 'resend_from';
  v_from := coalesce(nullif(v_from, ''), 'Modu Pro <onboarding@resend.dev>');

  select notification into v_notification from site_settings limit 1;
  v_recipient := coalesce(
    nullif(v_notification ->> 'enquiryRecipientEmail', ''),
    'moduproinnovations2805@gmail.com'
  );

  v_body := concat_ws(E'\n',
    'New B2B Enquiry Received',
    'Reference: ' || new.reference,
    'Full Name: ' || new."fullName",
    'Company: ' || new."companyName",
    'Phone: ' || new.phone,
    'Email: ' || new.email,
    'Division / Category: ' || new."divisionName",
    nullif('Service Category: ' || new."serviceCategory", 'Service Category: '),
    nullif('Machine / Product Details: ' || new."machineOrProductDetails", 'Machine / Product Details: '),
    'Source Page: ' || new."sourcePage",
    '',
    'Requirement / Message:',
    new.message
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(v_recipient),
      'subject', '[Modu Pro Enquiry ' || new.reference || '] ' || new."divisionName" || ' - ' || new."companyName",
      'text', v_body,
      'html', format(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0A1428;font-family:Arial,Helvetica,sans-serif;color:#F4EEDF;">'
        || '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#0A1428;padding:24px 0;"><tr><td align="center">'
        || '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#16294D;border:1px solid #D9C08B;max-width:600px;width:100%%;">'
        || '<tr><td style="padding:24px 32px;border-bottom:1px solid #D9C08B;background:#0A1428;">'
        || '<span style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#D9C08B;font-weight:700;">Modu Pro Innovation Pvt. Ltd.</span><br>'
        || '<span style="font-family:Georgia,serif;font-size:22px;color:#F4EEDF;font-weight:500;">New B2B Enquiry Received</span>'
        || '</td></tr>'
        || '<tr><td style="padding:24px 32px;">'
        || '<p style="margin:0 0 16px;font-size:13px;color:#D9C08B;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Reference %s</p>'
        || '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;width:38%%;">Full Name</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Company</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Email</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Division</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Service Category</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Machine / Product</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Source Page</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
        || '</table>'
        || '<p style="margin:16px 0 6px;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Requirement / Message</p>'
        || '<div style="background:#0A1428;border:1px solid #3F5E8C;padding:16px;color:#F4EEDF;font-size:14px;line-height:1.6;white-space:pre-wrap;">%s</div>'
        || '</td></tr>'
        || '<tr><td style="padding:16px 32px;background:#0A1428;border-top:1px solid #D9C08B;font-size:11px;color:#F4EEDF/70;text-align:center;">Modu Pro Innovation Pvt. Ltd. &middot; Nagpur, India</td></tr>'
        || '</table></td></tr></table></body></html>',
        new.reference,
        coalesce(new."fullName",''),
        coalesce(new."companyName",''),
        coalesce(new.phone,''),
        coalesce(new.email,''),
        coalesce(new."divisionName",''),
        coalesce(nullif(new."serviceCategory",''),'—'),
        coalesce(nullif(new."machineOrProductDetails",''),'—'),
        coalesce(new."sourcePage",''),
        coalesce(new.message,'')
      )
    )
  );

  if coalesce((v_notification ->> 'sendCustomerAcknowledgement')::boolean, true) then
    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', v_from,
        'to', jsonb_build_array(new.email),
        'subject', 'Enquiry Received (' || new.reference || ') - Modu Pro Innovation Pvt. Ltd.',
        'text', concat_ws(E'\n',
          'Dear ' || new."fullName" || ',',
          '',
          'Thank you for contacting Modu Pro Innovation Pvt. Ltd.',
          'Your enquiry has been recorded under reference number ' || new.reference ||
            ' and routed to our ' || new."divisionName" || ' team.',
          '',
          'Summary of your submission:',
          '- Company: ' || new."companyName",
          '- Division: ' || new."divisionName",
          '',
          'Warm regards,',
          'Modu Pro Innovation Pvt. Ltd.',
          'Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur - 440008'
        ),
        'html', format(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0A1428;font-family:Arial,Helvetica,sans-serif;color:#F4EEDF;">'
          || '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#0A1428;padding:24px 0;"><tr><td align="center">'
          || '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#16294D;border:1px solid #D9C08B;max-width:600px;width:100%%;">'
          || '<tr><td style="padding:24px 32px;border-bottom:1px solid #D9C08B;background:#0A1428;">'
          || '<span style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#D9C08B;font-weight:700;">Modu Pro Innovation Pvt. Ltd.</span><br>'
          || '<span style="font-family:Georgia,serif;font-size:22px;color:#F4EEDF;font-weight:500;">Thank you for your enquiry</span>'
          || '</td></tr>'
          || '<tr><td style="padding:24px 32px;">'
          || '<p style="margin:0 0 16px;font-size:15px;color:#F4EEDF;line-height:1.6;">Dear %s,</p>'
          || '<p style="margin:0 0 16px;font-size:15px;color:#F4EEDF;line-height:1.6;">Thank you for contacting Modu Pro Innovation Pvt. Ltd. Your enquiry has been recorded under reference <strong style="color:#D9C08B;">%s</strong> and routed to our %s team.</p>'
          || '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">'
          || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;width:38%%;">Company</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
          || '<tr><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#D9C08B;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">Division</td><td style="padding:8px 0;border-bottom:1px solid #3F5E8C;color:#F4EEDF;font-size:14px;">%s</td></tr>'
          || '</table>'
          || '<p style="margin:16px 0;font-size:14px;color:#F4EEDF;line-height:1.6;">Our team will review your requirement and get back to you shortly.</p>'
          || '<p style="margin:0;font-size:14px;color:#F4EEDF;line-height:1.6;">Warm regards,<br><strong>Modu Pro Innovation Pvt. Ltd.</strong><br><span style="font-size:12px;color:#F4EEDF/80;">Plot No. 27, Hanuman Daal Mill Road, opposite Royal Touch, Nagpur - 440008</span></p>'
          || '</td></tr>'
          || '<tr><td style="padding:16px 32px;background:#0A1428;border-top:1px solid #D9C08B;font-size:11px;color:#F4EEDF/70;text-align:center;">Modu Pro Innovation Pvt. Ltd. &middot; Nagpur, India</td></tr>'
          || '</table></td></tr></table></body></html>',
          coalesce(new."fullName",''),
          new.reference,
          coalesce(new."divisionName",''),
          coalesce(new."companyName",''),
          coalesce(new."divisionName",'')
        )
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_enquiry on enquiries;
create trigger notify_enquiry after insert on enquiries
  for each row execute function notify_enquiry();


-- ============================================================
-- Storage: public `media` bucket, admin-only writes
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

notify pgrst, 'reload schema';
