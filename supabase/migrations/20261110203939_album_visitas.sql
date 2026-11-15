alter table public.visitas
  add column fotos_adicionais text[] not null default '{}',
  add constraint visitas_album_valido check (
    cardinality(fotos_adicionais) <= 4
    and (cardinality(fotos_adicionais) = 0 or array_ndims(fotos_adicionais) = 1)
    and array_position(fotos_adicionais, null) is null
    and (foto_path is null or not foto_path = any(fotos_adicionais))
    and array_to_string(fotos_adicionais, ',') ~ (
      '^(' || usuario_id::text || '/[a-zA-Z0-9_.-]+)(,' ||
      usuario_id::text || '/[a-zA-Z0-9_.-]+)*$|^$'
    )
  );
