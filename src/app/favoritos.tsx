import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BilheteVisita, Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import useListaPaginada from '../componentes/useListaPaginada';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import CampoTexto from '../componentes/CampoTexto';
import Icone from '../componentes/Icone';
import { useFeedback } from '../contextos/FeedbackContext';
import { definirFavorito, listarFavoritos } from '../servicos/socialService';
import { paleta } from '../lib/paleta';

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
    ListEmptyComponent={
      carregando ? <ActivityIndicator color={paleta.petroleo} /> : erro ? null : termo.trim() ? (
        <Text style={visual.subtitle}>Nenhum lugar salvo encontrado para esta busca.</Text>
      ) : (
        <View style={{ backgroundColor: '#FFF', borderColor: paleta.borda, borderWidth: 1, borderRadius: 18, padding: 20, alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: paleta.coralClaro, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icone nome="salvar" cor="#A54332" />
          </View>
          <Text style={visual.section}>Nenhum lugar salvo ainda</Text>
          <Text style={[visual.subtitle, { textAlign: 'center' }]}>Salve os lugares que você quer visitar a partir das publicações.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/explorar')}
            style={[visual.button, { flexDirection: 'row', gap: 8, alignSelf: 'stretch' }]}>
            <Icone nome="mundo" tamanho={20} cor="#FFF" />
            <Text style={[visual.buttonText, { flexShrink: 1 }]}>Explorar lugares</Text>
          </Pressable>
        </View>
      )
    }
    ListFooterComponent={<View>{erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Não foi possível carregar. Tentar novamente.</Text></Pressable>}{mais && !erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais lugares</Text></Pressable>}</View>} />
  </SafeAreaView>;
}
