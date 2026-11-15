import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { contarNaoLidas } from '../servicos/socialService';
import { visual } from './Design';
import Text from './Texto';

export default function AtalhosPessoais() {
  const { sessao } = useAutenticacao();
  const [naoLidas, setNaoLidas] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    async function carregar() {
      if (!sessao) return;
      try { const total = await contarNaoLidas(sessao.user.id); if (ativo) setNaoLidas(total); } catch { /* A lista de notificações permite tentar novamente. */ }
    }
    void carregar();
    const temporizador = setInterval(() => void carregar(), 30000);
    return () => { ativo = false; clearInterval(temporizador); };
  }, [sessao?.user.id]));
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, marginVertical: 10 }}>
    <Pressable accessibilityRole="button" onPress={() => router.push('./mapa')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Mapa</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('./favoritos')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Quero conhecer</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('./notificacoes')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Notificações{naoLidas ? ` (${naoLidas})` : ''}</Text></Pressable>
  </View>;
}
