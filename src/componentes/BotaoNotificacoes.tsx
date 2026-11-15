import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { contarNaoLidas } from '../servicos/socialService';
import { paleta } from '../lib/paleta';
import Icone from './Icone';
import Text from './Texto';

export default function BotaoNotificacoes() {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id;
  const [naoLidas, setNaoLidas] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    let consultando = false;
    setNaoLidas(0);
    async function carregar() {
      if (!usuarioId || consultando || AppState.currentState === 'background') return;
      consultando = true;
      try {
        const total = await contarNaoLidas(usuarioId);
        if (ativo) setNaoLidas(total);
      } catch { /* A tela de notificações permite atualizar e tentar novamente. */ }
      finally { consultando = false; }
    }
    void carregar();
    const temporizador = setInterval(() => void carregar(), 30000);
    const evento = AppState.addEventListener('change', estado => { if (estado === 'active') void carregar(); });
    return () => { ativo = false; clearInterval(temporizador); evento.remove(); };
  }, [usuarioId]));
  return <Pressable accessibilityRole="button" accessibilityLabel={naoLidas ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
    onPress={() => router.push('/notificacoes')} style={({ pressed }) => [styles.botao, pressed && { opacity: 0.65 }]}>
    <Icone nome="notificacoes" tamanho={24} />
    {naoLidas > 0 && <View pointerEvents="none" style={styles.contador}><Text style={styles.numero}>{naoLidas > 99 ? '99+' : naoLidas}</Text></View>}
  </Pressable>;
}

const styles = StyleSheet.create({
  botao: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: paleta.borda, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  contador: { position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, backgroundColor: '#B74D39', borderWidth: 2, borderColor: paleta.papel, justifyContent: 'center', alignItems: 'center' },
  numero: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', lineHeight: 12, includeFontPadding: false },
});
