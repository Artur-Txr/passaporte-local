-- Aplicado em 13/10/2026 no projeto Passaporte Local.
-- Funcao interna de event trigger: o aplicativo nao a utiliza via RPC.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Verificacao: anon=false, authenticated=false, postgres=true.
SELECT has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE') AS authenticated_execute,
       has_function_privilege('postgres', 'public.rls_auto_enable()', 'EXECUTE') AS postgres_execute;
