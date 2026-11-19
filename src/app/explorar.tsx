import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../componentes/Texto';
import InteracoesPublicacao from '../componentes/InteracoesPublicacao';
import Avatar from '../componentes/Avatar';
import Icone from '../componentes/Icone';
import useLayoutResponsivo from '../componentes/useLayoutResponsivo';
import { Filtro, NavegacaoInferior, visual } from '../componentes/Design';
import { categorias } from '../lib/validacaoVisita';
import { paleta } from '../lib/paleta';
import { formatarDataVisita } from '../lib/formatacaoData';
import { carregarFotoPublicacao, listarPublicacoes, type Publicacao } from '../servicos/comunidadeService';

export default function Explorar() {
  const { largura } = useLayoutResponsivo();
  const alturaFoto = Math.min(185, (largura - 44) / 2.15);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [filtros, setFiltros] = useState({ busca: '', categoria: '' });
  useEffect(() => {
    const temporizador = setTimeout(() => setFiltros({ busca, categoria }), 350);
    return () => clearTimeout(temporizador);
  }, [busca, categoria]);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [temMais, setTemMais] = useState(false);
  const pagina = useRef(0);
  const versao = useRef(0);
  const ocupado = useRef(false);

  const carregar = useCallback(async (reiniciar = false) => {
    if (ocupado.current) return;
    ocupado.current = true;
    const consulta = ++versao.current;
    const proxima = reiniciar ? 0 : pagina.current;
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarPublicacoes(proxima, filtros);
      if (consulta !== versao.current) return;
      setPublicacoes(anteriores => reiniciar ? lista : Array.from(new Map([...anteriores, ...lista].map(item => [item.id, item])).values()));
      pagina.current = proxima + 1;
      setTemMais(lista.length === 20);
    } catch {
      if (consulta === versao.current) setErro('Não foi possível carregar as visitas da comunidade. Tente novamente.');
    } finally {
      if (consulta === versao.current) {
        ocupado.current = false;
        setCarregando(false);
      }
    }
  }, [filtros]);

  useFocusEffect(useCallback(() => {
    void carregar(true);
    setPublicacoes([]);
    setTemMais(false);
    return () => { versao.current++; ocupado.current = false; };
  }, [carregar]));

  return (
    <SafeAreaView style={visual.screen}>
      <FlatList data={publicacoes} keyExtractor={item => item.id} contentContainerStyle={visual.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        refreshing={carregando} onRefresh={() => void carregar(true)}
        ListHeaderComponent={<View style={{ marginBottom: 20 }}>
          <Text accessibilityRole="header" style={visual.title}>Explorar</Text>
          <Text style={visual.subtitle}>Lugares e lembranças de quem também gosta de descobrir.</Text>
          <TextInput accessibilityLabel="Buscar lugar ou cidade" placeholder="Buscar lugar ou cidade" value={busca} onChangeText={setBusca}
            placeholderTextColor={paleta.suave} style={{ minHeight: 50, backgroundColor: '#FFF', color: paleta.tinta, borderWidth: 1, borderColor: paleta.borda, borderRadius: 14, paddingHorizontal: 14, fontFamily: 'Manrope', marginVertical: 12 }} />
          <Filtro valor={categoria} destaque={!!categoria} onChange={setCategoria} opcoes={[{ id: '', nome: 'Todas as categorias' }, ...categorias.map(nome => ({ id: nome, nome }))]} />
          {!!(busca || categoria) && <Pressable accessibilityRole="button" onPress={() => { setBusca(''); setCategoria(''); }} style={{ paddingVertical: 12 }}><Text style={visual.link}>Limpar busca e filtros</Text></Pressable>}
          {!!erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text accessibilityLiveRegion="polite" style={visual.subtitle}>{erro}</Text></Pressable>}
        </View>}
        renderItem={({ item }) => <CartaoPublicacao publicacao={item} alturaFoto={alturaFoto} />}
        ListEmptyComponent={carregando ? <ActivityIndicator color={paleta.petroleo} /> : !erro ? <Text style={visual.subtitle}>{filtros.busca || filtros.categoria ? 'Nenhum lugar encontrado. Experimente outra busca.' : 'As primeiras histórias da comunidade aparecerão aqui.'}</Text> : null}
        ListFooterComponent={temMais && !erro ? <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>{carregando ? 'Carregando…' : 'Ver mais visitas'}</Text></Pressable> : null}
      />
      <NavegacaoInferior ativa="explorar" />
    </SafeAreaView>
  );
}

function CartaoPublicacao({ publicacao, alturaFoto }: { publicacao: Publicacao; alturaFoto: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, tentar] = useState(0);
  const autor = publicacao.perfis?.nome ?? 'Viajante';
  const data = formatarDataVisita(publicacao.data_visita.split('-').reverse().join('/'));
  const abrirVisita = () => router.push({ pathname: '/publicacao', params: { id: publicacao.id } });
  useEffect(() => {
    let ativo = true;
    setUrl(null);
    setFalhou(false);
    if (publicacao.foto_path) {
      carregarFotoPublicacao(publicacao.foto_path).then(valor => { if (ativo) setUrl(valor); })
        .catch(() => { if (ativo) setFalhou(true); });
    }
    return () => { ativo = false; };
  }, [publicacao.foto_path, tentativa]);
  return (
    <View style={estilos.cartao}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${autor}`}
        onPress={() => router.push({ pathname: '/perfil-publico', params: { id: publicacao.usuario_id } })} style={estilos.autor}>
        <Avatar nome={autor} caminho={publicacao.perfis?.avatar_path} tamanho={34} />
        <Text style={[visual.section, { flex: 1 }]}>{autor}</Text>
      </Pressable>
      {url && !falhou && <Pressable accessibilityRole="button" accessibilityLabel={`Ver fotos de ${publicacao.lugar}`} onPress={abrirVisita}>
        <Image source={{ uri: url }} onError={() => setFalhou(true)} style={[estilos.foto, { height: alturaFoto }]} />
      </Pressable>}
      {falhou && <Pressable accessibilityRole="button" onPress={() => tentar(valor => valor + 1)} style={{ padding: 16 }}><Text style={visual.link}>Tentar carregar foto</Text></Pressable>}
      <Pressable accessibilityRole="button" accessibilityHint="Abre a visita completa" onPress={abrirVisita} style={estilos.corpo}>
        <View style={estilos.titulo}>
          <Text style={estilos.lugar}>{publicacao.lugar}</Text>
          <Text style={estilos.categoria}>{publicacao.categoria}</Text>
        </View>
        <View style={estilos.local}>
          <Icone nome="lugar" tamanho={15} cor={paleta.suave} />
          <Text style={[visual.meta, { flex: 1 }]}>{publicacao.cidade} · {publicacao.uf}  ·  {data}</Text>
        </View>
        {!!publicacao.comentario && <Text numberOfLines={2} style={visual.subtitle}>{publicacao.comentario}</Text>}
      </Pressable>
      <InteracoesPublicacao visitaId={publicacao.id} compacto />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: paleta.borda, overflow: 'hidden', marginBottom: 16 },
  autor: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8 },
  foto: { width: '100%', backgroundColor: paleta.claro },
  corpo: { padding: 14, gap: 4 },
  titulo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 4 },
  lugar: { color: paleta.tinta, fontSize: 18, fontWeight: '800', flexShrink: 1 },
  categoria: { color: paleta.petroleo, fontSize: 11, fontWeight: '700', backgroundColor: paleta.claro, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%' },
  local: { flexDirection: 'row', gap: 4, alignItems: 'center' },
});
