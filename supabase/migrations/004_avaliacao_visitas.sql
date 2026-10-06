begin;

alter table public.visitas
  add column avaliacao smallint
  check (avaliacao between 1 and 5);

commit;