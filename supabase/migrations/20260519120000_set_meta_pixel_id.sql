insert into public.site_settings (id, meta_pixel_id)
values (1, '1985772175647853')
on conflict (id) do update
set
  meta_pixel_id = excluded.meta_pixel_id,
  updated_at = now();
