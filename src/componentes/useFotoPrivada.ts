import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { useVisitas } from '../contextos/VisitasContext';
import { obterUrlFoto } from '../servicos/fotosService';

export default function useFotoPrivada(caminho: string | null) {
  const { sessao } = useAutenticacao();
  const { revisao } = useVisitas();
  const usuarioId = sessao?.user.id;
  const [estado, setEstado] = useState<{ url: string | null; erro: boolean; carregando: boolean }>({ url: null, erro: false, carregando: false });
  const [tentativa, setTentativa] = useState(0);
  const tentarNovamente = () => setTentativa(v => v + 1);
  useEffect(() => {
    let ativo = true;
    let versao = 0;
    async function carregar() {
      const consulta = ++versao;
      if (!usuarioId || !caminho) {
        setEstado({ url: null, erro: false, carregando: false });
        return;
      }
      setEstado({ url: null, erro: false, carregando: true });
      try {
        const url = await obterUrlFoto(usuarioId, caminho);
        if (ativo && consulta === versao) setEstado({ url, erro: false, carregando: false });
      } catch {
        if (ativo && consulta === versao) setEstado({ url: null, erro: true, carregando: false });
      }
    }
    void carregar();
    const evento = AppState.addEventListener('change', estado => { if (estado === 'active') void carregar(); });
    // A assinatura dura uma hora; renovar antes de expirar enquanto a tela está montada.
    const temporizador = setInterval(() => { if (AppState.currentState === 'active') void carregar(); }, 50 * 60 * 1000);
    return () => { ativo = false; evento.remove(); clearInterval(temporizador); };
  }, [usuarioId, caminho, tentativa, revisao]);
  return { ...estado, tentarNovamente, falhar: () => setEstado({ url: null, erro: true, carregando: false }) };
}
