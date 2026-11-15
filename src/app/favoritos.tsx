import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BilheteVisita, Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import useListaPaginada from '../componentes/useListaPaginada';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import CampoTexto from '../componentes/CampoTexto';
import { useFeedback } from '../contextos/FeedbackContext';
import { definirFavorito, listarFavoritos } from '../servicos/socialService';

export default function Favoritos() {
  const { sessao } = useAutenticacao();
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [removendo, setRemovendo] = useState<string | null>(null);
  const trava = useRef(false);
  const avisar = useFeedback();
  useEffect(() => { const timer = setTimeout(() => setTermo(busca), 350); return () => clearTimeout(timer); }, [busca]);
  const buscar = useCallback((pagina: number) => listarFavoritos(sessao?.user.id ?? '', pagina, termo), [sessao?.user.id, termo]);
  const { itens, carregando, erro, mais, carregar } = useListaPaginada(buscar);
  async function remover(id: string) {
    if (trava.current || !sessao) return;
    trava.current = true; setRemovendo(id);
    try { await definirFavorito(id, sessao.user.id, false); await carregar(true); avisar('Lugar removido de Quero conhecer.'); }
    catch { avisar('Não foi possível remover. Tente novamente.'); }
    finally { trava.current = false; setRemovendo(null); }
  }
  return <SafeAreaView style={visual.screen}><FlatList data={itens} keyExtractor={item => item.id} contentContainerStyle={visual.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" refreshing={carregando} onRefresh={() => void carregar(true)}
    ListHeaderComponent={<View style={{ marginBottom: 16 }}><Cabecalho titulo="Quero conhecer" voltar /><Text accessibilityRole="header" style={visual.title}>Próximas descobertas.</Text><Text style={visual.subtitle}>Os lugares que você salvou para visitar.</Text><CampoTexto icone="busca" accessibilityLabel="Buscar lugares salvos" placeholder="Buscar lugar ou cidade" value={busca} onChangeText={setBusca} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, marginVertical: 10, paddingRight: 12, color: '#123B4A' }} /></View>}
    renderItem={({ item }) => <View><BilheteVisita visita={{ ...item, data: item.data_visita.split('-').reverse().join('/') }} aoAbrir={() => router.push({ pathname: './publicacao', params: { id: item.id } })} /><Pressable accessibilityRole="button" accessibilityLabel={`Remover ${item.lugar} de Quero conhecer`} disabled={!!removendo || carregando} onPress={() => void remover(item.id)} style={{ minHeight: 44, justifyContent: 'center', marginBottom: 16 }}><Text style={visual.link}>{removendo === item.id ? 'Removendo…' : 'Remover da lista'}</Text></Pressable></View>}
    ListEmptyComponent={carregando ? <ActivityIndicator /> : !erro ? <Text style={visual.subtitle}>{termo ? 'Nenhum lugar salvo encontrado para esta busca.' : 'Toque em Quero conhecer nas publicações para salvar seus próximos passeios.'}</Text> : null}
    ListFooterComponent={<View>{erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Não foi possível carregar. Tentar novamente.</Text></Pressable>}{mais && !erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais lugares</Text></Pressable>}</View>} />
  </SafeAreaView>;
}
