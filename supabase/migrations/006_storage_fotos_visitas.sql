begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'fotos-visitas',
  'fotos-visitas',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "consultar_proprias_fotos_visitas"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'fotos-visitas'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "enviar_proprias_fotos_visitas"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'fotos-visitas'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "excluir_proprias_fotos_visitas"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'fotos-visitas'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

commit;