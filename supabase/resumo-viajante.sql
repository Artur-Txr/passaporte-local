create function public.resumo_viajante(viajante_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('visitas',(select count(*) from public.visitas where usuario_id=viajante_id),'cidades',coalesce((select jsonb_agg(c) from (select cidade,uf,count(*) as quantidade from public.visitas where usuario_id=viajante_id group by cidade,uf order by cidade,uf)c),'[]'::jsonb));
$$;
revoke all on function public.resumo_viajante(uuid) from public,anon;
grant execute on function public.resumo_viajante(uuid) to authenticated;
