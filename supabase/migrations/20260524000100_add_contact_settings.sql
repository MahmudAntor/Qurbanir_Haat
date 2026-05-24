alter table public.site_settings
  add column if not exists contact_email text not null default 'info.qurbanirhaat@gmail.com',
  add column if not exists contact_location text not null default 'Dhaka, Bangladesh';

alter table public.site_settings
  alter column whatsapp_number set default '8801715155505';

update public.site_settings
set
  whatsapp_number = case
    when whatsapp_number = '8801700000000' then '8801715155505'
    else whatsapp_number
  end,
  contact_email = 'info.qurbanirhaat@gmail.com',
  contact_location = 'Dhaka, Bangladesh'
where id = 1;
