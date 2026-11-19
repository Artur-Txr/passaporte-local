import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, View } from 'react-native';
import { paleta } from '../lib/paleta';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { useFeedback } from '../contextos/FeedbackContext';
import { consultarFavorito, definirFavorito } from '../servicos/socialService';
import { visual } from './Design';
import Icone from './Icone';
import Text from './Texto';

export default function BotaoFavorito({ visitaId, compacto = false }: { visitaId: string; compacto?: boolean }) {
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
  const desabilitado = ocupado || salvo === null;
  const cor = salvo ? '#A54332' : paleta.petroleo;
  return <View style={{ maxWidth: '100%' }}>
    <Pressable accessibilityRole="button"
      accessibilityLabel={salvo ? 'Remover de Quero conhecer' : 'Salvar em Quero conhecer'}
      accessibilityState={{ selected: salvo ?? false, disabled: desabilitado }}
      disabled={desabilitado}
      onPress={alternar}
      style={({ pressed }) => ({
        minHeight: 44, minWidth: 44, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, gap: 4,
        borderRadius: 12, backgroundColor: salvo ? paleta.coralClaro : 'transparent',
        opacity: desabilitado || pressed ? 0.55 : 1,
      })}>
      <Icone nome={salvo ? 'salvo' : 'salvar'} tamanho={20} cor={cor} />
      <Text style={{ color: cor, fontSize: 13, fontWeight: '700', flexShrink: 1 }}>
        {salvo ? (compacto ? 'Salvo' : 'Salvo em Quero conhecer') : (compacto ? 'Salvar' : 'Quero conhecer')}
      </Text>
    </Pressable>
    {!!erro && <Pressable accessibilityRole="button" onPress={() => tentar(valor => valor + 1)}><Text style={visual.subtitle}>{erro}</Text></Pressable>}
  </View>;
}
