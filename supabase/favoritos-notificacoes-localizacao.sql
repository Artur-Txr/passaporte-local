begin;
alter table public.visitas add column latitude double precision, add column longitude double precision;
alter table public.visitas add constraint visitas_coordenadas_validas check(
 (latitude is null and longitude is null) or (latitude is not null and longitude is not null and latitude between -90 and 90 and longitude between -180 and 180));
create table public.favoritos(
 usuario_id uuid not null references public.perfis(id) on delete cascade,
 visita_id uuid not null references public.visitas(id) on delete cascade,
 criado_em timestamptz not null default now(),
 primary key(usuario_id,visita_id));
create index favoritos_visita_idx on public.favoritos(visita_id);
alter table public.favoritos enable row level security;
revoke all on public.favoritos from public,anon,authenticated;
grant select,insert,delete on public.favoritos to authenticated;
create policy ler_favoritos on public.favoritos for select to authenticated using(usuario_id=(select auth.uid()));
create policy salvar_favorito on public.favoritos for insert to authenticated with check(usuario_id=(select auth.uid()));
create policy excluir_favorito on public.favoritos for delete to authenticated using(usuario_id=(select auth.uid()));
create table public.notificacoes(
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null references public.perfis(id) on delete cascade,
 ator_id uuid not null references public.perfis(id) on delete cascade,
 visita_id uuid not null references public.visitas(id) on delete cascade,
 comentario_id uuid references public.comentarios(id) on delete cascade,
 tipo text not null check(tipo in('curtida','comentario')),
 lida_em timestamptz,
 criado_em timestamptz not null default now());
create index notificacoes_destinatario_data_idx on public.notificacoes(usuario_id,criado_em desc,id);
create index notificacoes_ator_idx on public.notificacoes(ator_id);
create index notificacoes_visita_idx on public.notificacoes(visita_id);
create unique index notificacoes_curtida_unica on public.notificacoes(visita_id,ator_id) where tipo='curtida';
create unique index notificacoes_comentario_unico on public.notificacoes(comentario_id) where comentario_id is not null;
alter table public.notificacoes enable row level security;
revoke all on public.notificacoes from public,anon,authenticated;
grant select on public.notificacoes to authenticated;
grant update(lida_em) on public.notificacoes to authenticated;
create policy ler_notificacoes on public.notificacoes for select to authenticated using(usuario_id=(select auth.uid()));
create policy marcar_notificacao_lida on public.notificacoes for update to authenticated using(usuario_id=(select auth.uid())) with check(usuario_id=(select auth.uid()));
create function interno.notificar_interacao() returns trigger language plpgsql security definer set search_path='' as $$
declare dono uuid;
begin
 if TG_OP='DELETE' then
  if TG_TABLE_NAME='curtidas' then delete from public.notificacoes where tipo='curtida' and visita_id=old.visita_id and ator_id=old.usuario_id; end if;
  return old;
 end if;
 select usuario_id into dono from public.visitas where id=new.visita_id;
 if dono is null or dono=new.usuario_id then return new; end if;
 if TG_TABLE_NAME='curtidas' then
  insert into public.notificacoes(usuario_id,ator_id,visita_id,tipo) values(dono,new.usuario_id,new.visita_id,'curtida') on conflict do nothing;
 else
  insert into public.notificacoes(usuario_id,ator_id,visita_id,comentario_id,tipo) values(dono,new.usuario_id,new.visita_id,new.id,'comentario') on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function interno.notificar_interacao() from public,anon,authenticated;
create trigger notificar_curtida after insert or delete on public.curtidas for each row execute function interno.notificar_interacao();
create trigger notificar_comentario after insert on public.comentarios for each row execute function interno.notificar_interacao();
commit;
