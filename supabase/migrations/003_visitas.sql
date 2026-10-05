begin;

-- Cada visita pertence ao perfil de um usuário.
create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),

  usuario_id uuid not null
    references public.perfis(id) on delete cascade,

  lugar varchar(120) not null
    check (char_length(trim(lugar)) > 0),

  cidade varchar(100) not null
    check (char_length(trim(cidade)) > 0),

  uf varchar(2) not null
    check (
      uf in (
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
        'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
        'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
        'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      )
    ),

  categoria varchar(20) not null
    check (
      categoria in ('Parque', 'Museu', 'Cafeteria', 'Outro')
    ),

  data_visita date not null
    check (data_visita >= date '1900-01-01'),

  comentario varchar(500) not null default '',

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Ajuda a consultar as visitas de cada usuário.
create index if not exists visitas_usuario_id_idx
on public.visitas(usuario_id);

-- Ativa a proteção por registro.
alter table public.visitas enable row level security;

-- Define as operações disponíveis para usuários conectados.
revoke all on table public.visitas
from public, anon, authenticated;

grant select, insert, update, delete
on table public.visitas
to authenticated;

-- Consultar somente as próprias visitas.
drop policy if exists "consultar_proprias_visitas"
on public.visitas;

create policy "consultar_proprias_visitas"
on public.visitas
for select
to authenticated
using ((select auth.uid()) = usuario_id);

-- Cadastrar somente visitas pertencentes à própria conta.
drop policy if exists "cadastrar_proprias_visitas"
on public.visitas;

create policy "cadastrar_proprias_visitas"
on public.visitas
for insert
to authenticated
with check ((select auth.uid()) = usuario_id);

-- Editar somente as próprias visitas.
drop policy if exists "editar_proprias_visitas"
on public.visitas;

create policy "editar_proprias_visitas"
on public.visitas
for update
to authenticated
using ((select auth.uid()) = usuario_id)
with check ((select auth.uid()) = usuario_id);

-- Excluir somente as próprias visitas.
drop policy if exists "excluir_proprias_visitas"
on public.visitas;

create policy "excluir_proprias_visitas"
on public.visitas
for delete
to authenticated
using ((select auth.uid()) = usuario_id);

-- Atualiza a data de modificação automaticamente.
create or replace function public.atualizar_data_visita()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

revoke execute
on function public.atualizar_data_visita()
from public, anon, authenticated;

drop trigger if exists atualizar_data_visita
on public.visitas;

create trigger atualizar_data_visita
before update on public.visitas
for each row
execute function public.atualizar_data_visita();

commit;