import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../componentes/Avatar';
import { BilheteVisita, Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import { listarPublicacoes, obterPerfilPublico, obterResumoViajante, type Publicacao } from '../servicos/comunidadeService';
import { chaveCidade, rotuloCidade } from '../lib/cidades';

export default function PerfilPublico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfil, setPerfil] = useState<Awaited<ReturnType<typeof obterPerfilPublico>> | null>(null);
  const [visitas, setVisitas] = useState<Publicacao[]>([]);
  const [resumo, setResumo] = useState<Awaited<ReturnType<typeof obterResumoViajante>> | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mais, setMais] = useState(false);
  const pagina = useRef(0);
  const versao = useRef(0);
  const trava = useRef(false);
  const carregar = useCallback(async (reiniciar = false) => {
    if (trava.current) return;
    trava.current = true;
    const consulta = ++versao.current;
    setCarregando(true);
    setErro('');
    const proxima = reiniciar ? 0 : pagina.current;
    try {
      const [autor, lista, estatisticas] = await Promise.all([obterPerfilPublico(id), listarPublicacoes(proxima, { usuarioId: id }), obterResumoViajante(id)]);
      if (consulta !== versao.current) return;
      setPerfil(autor);
      setResumo(estatisticas);
      setVisitas(anteriores => reiniciar ? lista : Array.from(new Map([...anteriores, ...lista].map(item => [item.id, item])).values()));
      setMais(lista.length === 20);
      pagina.current = proxima + 1;
    } catch {
      if (consulta === versao.current) setErro('Não foi possível carregar este perfil. Toque para tentar novamente.');
    } finally {
      if (consulta === versao.current) { trava.current = false; setCarregando(false); }
    }
  }, [id]);
  useFocusEffect(useCallback(() => { void carregar(true); return () => { versao.current++; trava.current = false; }; }, [carregar]));
  const cidades = Array.from(new Map(resumo?.cidades.map(cidade => [chaveCidade(cidade.cidade, cidade.uf), rotuloCidade(cidade.cidade, cidade.uf)])).values());
  return <SafeAreaView style={visual.screen}>
    <FlatList data={visitas} keyExtractor={visita => visita.id} contentContainerStyle={visual.content} refreshing={carregando} onRefresh={() => void carregar(true)}
      ListHeaderComponent={<View style={{ marginBottom: 16 }}>
        <Cabecalho titulo="Perfil de viajante" voltar />
        {perfil && <View style={{ gap: 12, marginVertical: 12 }}><Avatar nome={perfil.nome} caminho={perfil.avatar_path} tamanho={72} /><Text accessibilityRole="header" style={visual.title}>{perfil.nome}</Text><Text style={visual.subtitle}>Lugares e histórias pelo Brasil.</Text></View>}
        {resumo && <View style={{ gap: 8, marginBottom: 12 }}>
          <Text style={visual.section}>{resumo.visitas} visitas · {cidades.length} cidades</Text>
          <Text style={visual.subtitle}>{cidades.join('  •  ')}</Text>
        </View>}
        {!!erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)}><Text style={visual.subtitle}>{erro}</Text></Pressable>}
      </View>}
      ListEmptyComponent={carregando ? <ActivityIndicator /> : !erro ? <Text style={visual.subtitle}>As visitas deste viajante aparecerão aqui.</Text> : null}
      renderItem={({ item }) => <BilheteVisita visita={{ ...item, data: item.data_visita.split('-').reverse().join('/') }} aoAbrir={() => router.push({ pathname: './publicacao', params: { id: item.id } })} />}
      ListFooterComponent={mais && !erro ? <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais visitas</Text></Pressable> : null}
    />
  </SafeAreaView>;
}
