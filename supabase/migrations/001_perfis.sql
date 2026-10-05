begin;

-- Cria a tabela de perfis.
create table if not exists public.perfis (
  id uuid primary key
    references auth.users(id) on delete cascade,

  nome varchar(80) not null
    check (char_length(trim(nome)) > 0),

  criado_em timestamptz not null default now()
);

-- Ativa a proteção por usuário.
alter table public.perfis enable row level security;

-- Define as permissões da tabela.
revoke all on table public.perfis
  from public, anon, authenticated;

grant select on table public.perfis to authenticated;
grant update (nome) on table public.perfis to authenticated;

-- Permite consultar somente o próprio perfil.
drop policy if exists "consultar_proprio_perfil"
  on public.perfis;

create policy "consultar_proprio_perfil"
on public.perfis
for select
to authenticated
using ((select auth.uid()) = id);

-- Permite editar somente o próprio perfil.
drop policy if exists "editar_proprio_perfil"
  on public.perfis;

create policy "editar_proprio_perfil"
on public.perfis
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

commit;