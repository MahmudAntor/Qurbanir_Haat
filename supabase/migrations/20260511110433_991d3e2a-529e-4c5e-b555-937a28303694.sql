
create or replace function public.bootstrap_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;

revoke execute on function public.bootstrap_first_admin() from anon, authenticated, public;

drop trigger if exists trg_bootstrap_first_admin on auth.users;
create trigger trg_bootstrap_first_admin after insert on auth.users
  for each row execute function public.bootstrap_first_admin();
