begin;

-- Define como criar o perfil de uma nova conta.
create or replace function public.criar_perfil_passaporte()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
        'Viajante'
      ),
      80
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- A função será executada pelo gatilho, não pelo aplicativo.
revoke execute
on function public.criar_perfil_passaporte()
from public, anon, authenticated;

-- Executa a função quando uma conta é criada.
drop trigger if exists criar_perfil_passaporte
on auth.users;

create trigger criar_perfil_passaporte
after insert on auth.users
for each row
execute function public.criar_perfil_passaporte();

-- Cria os perfis das contas que já existem.
insert into public.perfis (id, nome)
select
  id,
  left(
    coalesce(
      nullif(trim(raw_user_meta_data ->> 'nome'), ''),
      'Viajante'
    ),
    80
  )
from auth.users
on conflict (id) do nothing;

commit;