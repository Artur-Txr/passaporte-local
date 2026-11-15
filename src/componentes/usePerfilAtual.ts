import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { obterPerfilPublico } from '../servicos/comunidadeService';
import { revisarAvataresAntigos } from '../servicos/perfilService';

export default function usePerfilAtual() {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id;
  const [perfil, setPerfil] = useState<Awaited<ReturnType<typeof obterPerfilPublico>> | null>(null);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    if (usuarioId) void revisarAvataresAntigos(usuarioId);
    if (usuarioId) obterPerfilPublico(usuarioId).then(valor => { if (ativo) setPerfil(valor); }).catch(() => {});
    return () => { ativo = false; };
  }, [usuarioId, sessao?.user.updated_at]));
  return perfil?.id === usuarioId ? perfil : null;
}
