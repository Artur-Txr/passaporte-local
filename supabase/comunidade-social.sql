begin;
create policy consultar_visitas_comunidade on public.visitas for select to authenticated using (true);
create policy consultar_nomes_comunidade on public.perfis for select to authenticated using (true);
create policy consultar_fotos_comunidade on storage.objects for select to authenticated using (bucket_id='fotos-visitas' and exists (select 1 from public.visitas v where v.foto_path=storage.objects.name or storage.objects.name=any(v.fotos_adicionais)));
create table public.curtidas (
 visita_id uuid not null references public.visitas(id) on delete cascade,
 usuario_id uuid not null references public.perfis(id) on delete cascade,
 criado_em timestamptz not null default now(),
 primary key (visita_id,usuario_id)
);
create index curtidas_usuario_idx on public.curtidas(usuario_id);
create table public.comentarios (
 id uuid primary key default gen_random_uuid(),
 visita_id uuid not null references public.visitas(id) on delete cascade,
 usuario_id uuid not null references public.perfis(id) on delete cascade,
 texto text not null check(char_length(trim(texto)) between 1 and 500),
 criado_em timestamptz not null default now()
);
create index comentarios_visita_data_idx on public.comentarios(visita_id,criado_em,id);
create index comentarios_usuario_idx on public.comentarios(usuario_id);
alter table public.curtidas enable row level security;
alter table public.comentarios enable row level security;
revoke all on public.curtidas,public.comentarios from public,anon,authenticated;
grant select,insert,delete on public.curtidas,public.comentarios to authenticated;
create policy ler_curtidas on public.curtidas for select to authenticated using(true);
create policy curtir_com_propria_conta on public.curtidas for insert to authenticated with check(usuario_id=(select auth.uid()));
create policy remover_propria_curtida on public.curtidas for delete to authenticated using(usuario_id=(select auth.uid()));
create policy ler_comentarios on public.comentarios for select to authenticated using(true);
create policy comentar_com_propria_conta on public.comentarios for insert to authenticated with check(usuario_id=(select auth.uid()));
create policy remover_proprio_comentario on public.comentarios for delete to authenticated using(usuario_id=(select auth.uid()));
commit;
select 'Comunidade configurada' as resultado;