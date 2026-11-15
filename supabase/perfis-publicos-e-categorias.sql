begin;
alter table public.visitas drop constraint visitas_categoria_check;
alter table public.visitas add constraint visitas_categoria_check check(categoria in ('Museu','Cafeteria','Centro histórico','Arquitetura','Natureza','Trilha','Cachoeira','Praia','Parque','Mirante','Cultura','Gastronomia','Outro'));
alter table public.visitas add column origem_colecao integer;
create unique index visitas_origem_colecao_idx on public.visitas(usuario_id,origem_colecao) where origem_colecao is not null;
alter table public.perfis add column avatar_path text;
alter table public.perfis add constraint perfil_avatar_proprio check(avatar_path is null or avatar_path ~ ('^'||id::text||'/[a-zA-Z0-9_.-]+$'));
grant update(avatar_path) on public.perfis to authenticated;
create schema if not exists interno;
revoke all on schema interno from public,anon,authenticated;
create function interno.sincronizar_nome_perfil() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.perfis set nome=left(coalesce(nullif(trim(new.raw_user_meta_data->>'nome'),''),'Viajante'),80) where id=new.id;
 return new;
end $$;
revoke all on function interno.sincronizar_nome_perfil() from public,anon,authenticated;
create trigger sincronizar_nome_perfil after update of raw_user_meta_data on auth.users for each row execute function interno.sincronizar_nome_perfil();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatares','avatares',false,20971520,array['image/jpeg','image/png','image/webp']);
create policy ver_avatares on storage.objects for select to authenticated using(bucket_id='avatares' and exists(select 1 from public.perfis p where p.avatar_path=storage.objects.name));
create policy enviar_avatar on storage.objects for insert to authenticated with check(bucket_id='avatares' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy ler_proprio_avatar on storage.objects for select to authenticated using(bucket_id='avatares' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy excluir_avatar on storage.objects for delete to authenticated using(bucket_id='avatares' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
