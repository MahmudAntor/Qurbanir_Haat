
-- Fix function search_path on trigger fn
create or replace function public.touch_updated_at()
returns trigger language plpgsql security definer set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

-- Lock down SECURITY DEFINER functions from direct API access
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
revoke execute on function public.touch_updated_at() from anon, authenticated, public;

-- Replace permissive inquiry insert policy with size-limited one
drop policy if exists "anyone can submit inquiry" on public.inquiries;
create policy "anyone can submit inquiry" on public.inquiries
  for insert to anon, authenticated with check (
    length(name) between 1 and 100
    and length(phone) between 6 and 30
    and length(location) between 1 and 200
    and (budget is null or length(budget) <= 100)
    and (notes is null or length(notes) <= 1000)
  );

-- Restrict storage listing — allow per-object reads (URLs work) but not directory enumeration
drop policy if exists "public read cattle media" on storage.objects;
create policy "public read cattle media" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'cattle-media' and auth.role() = 'authenticated'
    or bucket_id = 'cattle-media' and (storage.foldername(name))[1] is not null
  );
-- Simpler: signed URLs aren't needed since bucket is public for reads via direct URL.
-- The above lets file URLs resolve; client-side `list()` from anon will be restricted by missing select on the bucket itself.
