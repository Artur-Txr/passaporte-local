begin;
create or replace function public.criar_perfil_passaporte()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 insert into public.perfis(id,nome) values(new.id,
 left(coalesce(nullif(trim(new.raw_user_meta_data->>'nome'),''),
 nullif(trim(new.raw_user_meta_data->>'full_name'),''),
 nullif(trim(new.raw_user_meta_data->>'name'),''),'Viajante'),80))
 on conflict(id) do nothing;
 return new;
end;
$$;
revoke execute on function public.criar_perfil_passaporte() from public,anon,authenticated;
create or replace function interno.sincronizar_nome_perfil()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 update public.perfis set nome=left(coalesce(
 nullif(trim(new.raw_user_meta_data->>'nome'),''),
 nullif(trim(new.raw_user_meta_data->>'full_name'),''),
 nullif(trim(new.raw_user_meta_data->>'name'),''),'Viajante'),80) where id=new.id;
 return new;
end;
$$;
revoke all on function interno.sincronizar_nome_perfil() from public,anon,authenticated;
commit;
