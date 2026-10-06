begin;

alter table public.visitas
  add column foto_path text;

commit;
