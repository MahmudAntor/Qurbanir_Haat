
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Cattle
create type public.cattle_status as enum ('Available', 'Reserved', 'Sold');

create table public.cattle (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  breed text not null,
  color text not null default '',
  weight_kg integer not null default 0,
  age_teeth integer not null default 2,
  height_inches integer not null default 0,
  feed text not null default '',
  health text not null default '',
  price_bdt integer not null default 0,
  status public.cattle_status not null default 'Available',
  image_url text,
  video_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cattle enable row level security;

create policy "public read cattle" on public.cattle
  for select to anon, authenticated using (true);
create policy "admins insert cattle" on public.cattle
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update cattle" on public.cattle
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete cattle" on public.cattle
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_cattle_updated_at before update on public.cattle
  for each row execute function public.touch_updated_at();

-- Inquiries
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  location text not null,
  budget text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;

create policy "anyone can submit inquiry" on public.inquiries
  for insert to anon, authenticated with check (true);
create policy "admins read inquiries" on public.inquiries
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete inquiries" on public.inquiries
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Site Settings (single row)
create table public.site_settings (
  id smallint primary key default 1,
  whatsapp_number text not null default '8801700000000',
  meta_pixel_id text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
alter table public.site_settings enable row level security;
insert into public.site_settings (id) values (1) on conflict do nothing;

create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admins update settings" on public.site_settings
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for cow photos/videos
insert into storage.buckets (id, name, public) values ('cattle-media', 'cattle-media', true)
on conflict (id) do nothing;

create policy "public read cattle media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'cattle-media');
create policy "admins upload cattle media" on storage.objects
  for insert to authenticated with check (bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin'));
create policy "admins update cattle media" on storage.objects
  for update to authenticated using (bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin'));
create policy "admins delete cattle media" on storage.objects
  for delete to authenticated using (bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin'));
