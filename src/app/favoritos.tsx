import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BilheteVisita, Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import useListaPaginada from '../componentes/useListaPaginada';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { listarFavoritos } from '../servicos/socialService';

export default function Favoritos() {
  const { sessao } = useAutenticacao();
  const buscar = useCallback((pagina: number) => listarFavoritos(sessao?.user.id ?? '', pagina), [sessao?.user.id]);
  const { itens, carregando, erro, mais, carregar } = useListaPaginada(buscar);
  return <SafeAreaView style={visual.screen}><FlatList data={itens} keyExtractor={item => item.id} contentContainerStyle={visual.content} refreshing={carregando} onRefresh={() => void carregar(true)}
    ListHeaderComponent={<View style={{ marginBottom: 16 }}><Cabecalho titulo="Quero conhecer" voltar /><Text accessibilityRole="header" style={visual.title}>Próximas descobertas.</Text><Text style={visual.subtitle}>Os lugares que você salvou para visitar.</Text></View>}
    renderItem={({ item }) => <BilheteVisita visita={{ ...item, data: item.data_visita.split('-').reverse().join('/') }} aoAbrir={() => router.push({ pathname: './publicacao', params: { id: item.id } })} />}
    ListEmptyComponent={carregando ? <ActivityIndicator /> : !erro ? <Text style={visual.subtitle}>Toque em Quero conhecer nas publicações para salvar seus próximos passeios.</Text> : null}
    ListFooterComponent={<View>{erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Não foi possível carregar. Tentar novamente.</Text></Pressable>}{mais && !erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais lugares</Text></Pressable>}</View>} />
  </SafeAreaView>;
}
