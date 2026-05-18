-- Repair/ensure the public storage bucket used by the admin media uploader.
-- This is intentionally idempotent so it can be run against projects where the
-- original schema migration ran before Storage was fully provisioned.
insert into storage.buckets (id, name, public)
values ('cattle-media', 'cattle-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read cattle media" on storage.objects;
drop policy if exists "admins upload cattle media" on storage.objects;
drop policy if exists "admins update cattle media" on storage.objects;
drop policy if exists "admins delete cattle media" on storage.objects;

create policy "public read cattle media" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'cattle-media'
    and (auth.role() = 'authenticated' or (storage.foldername(name))[1] is not null)
  );

create policy "admins upload cattle media" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin')
  );

create policy "admins update cattle media" on storage.objects
  for update to authenticated using (
    bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin')
  );

create policy "admins delete cattle media" on storage.objects
  for delete to authenticated using (
    bucket_id = 'cattle-media' and public.has_role(auth.uid(), 'admin')
  );
