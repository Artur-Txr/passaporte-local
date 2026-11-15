import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { useFeedback } from '../contextos/FeedbackContext';
import { consultarFavorito, definirFavorito } from '../servicos/socialService';
import { visual } from './Design';
import Text from './Texto';

export default function BotaoFavorito({ visitaId }: { visitaId: string }) {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id;
  const [salvo, setSalvo] = useState<boolean | null>(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [tentativa, tentar] = useState(0);
  const ativo = useRef(false);
  const trava = useRef(false);
  const avisar = useFeedback();
  useFocusEffect(useCallback(() => {
    ativo.current = true;
    let atual = true;
    if (usuarioId) consultarFavorito(visitaId, usuarioId).then(valor => { if (atual) { setSalvo(valor); setErro(''); } })
      .catch(() => { if (atual) setErro('Não foi possível conferir seus favoritos.'); });
    return () => { atual = false; ativo.current = false; };
  }, [visitaId, usuarioId, tentativa]));
  async function alternar() {
    if (!usuarioId || salvo === null || trava.current) return;
    trava.current = true;
    setOcupado(true);
    try {
      await definirFavorito(visitaId, usuarioId, !salvo);
      if (ativo.current) { setSalvo(!salvo); setErro(''); avisar(salvo ? 'Lugar removido dos favoritos.' : 'Lugar salvo em Quero conhecer.'); }
    } catch { if (ativo.current) { setErro('Não foi possível confirmar o favorito. Toque para atualizar.'); tentar(valor => valor + 1); } }
    finally { trava.current = false; if (ativo.current) setOcupado(false); }
  }
  return <View>
    <Pressable accessibilityRole="button" accessibilityState={{ selected: salvo ?? false }} disabled={ocupado || salvo === null} onPress={alternar} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text style={visual.link}>{salvo ? 'Salvo em Quero conhecer' : 'Quero conhecer'}</Text>
    </Pressable>
    {!!erro && <Pressable accessibilityRole="button" onPress={() => tentar(valor => valor + 1)}><Text style={visual.subtitle}>{erro}</Text></Pressable>}
  </View>;
}
