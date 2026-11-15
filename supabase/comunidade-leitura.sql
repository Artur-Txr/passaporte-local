-- Aplicar no projeto após conferir as políticas atuais.
begin;

-- Visitas e nomes visíveis a todas as contas conectadas.
create policy consultar_visitas_comunidade on public.visitas
for select to authenticated using (true);
create policy consultar_nomes_comunidade on public.perfis
for select to authenticated using (true);

-- Somente arquivos referenciados por visitas salvas podem ser lidos por outras contas.
create policy consultar_fotos_comunidade on storage.objects
for select to authenticated using (
  bucket_id = 'fotos-visitas'
  and exists (
    select 1 from public.visitas v
    where v.foto_path = name or name = any(v.fotos_adicionais)
  )
);

commit;
