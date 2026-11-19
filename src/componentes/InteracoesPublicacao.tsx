import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { paleta } from '../lib/paleta';
import { consultarCurtidas, definirCurtida, enviarComentario, listarComentarios, removerComentario, type ComentarioPublicacao } from '../servicos/comunidadeService';
import { visual } from './Design';
import Text from './Texto';
import Avatar from './Avatar';
import BotaoFavorito from './BotaoFavorito';
import Icone from './Icone';
import useRascunho from './useRascunho';

export default function InteracoesPublicacao({ visitaId, compacto = false }: { visitaId: string; compacto?: boolean }) {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id;
  const [curtidas, setCurtidas] = useState<Awaited<ReturnType<typeof consultarCurtidas>> | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [aberto, abrir] = useState(false);
  const [tentativa, tentar] = useState(0);
  const trava = useRef(false);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  useFocusEffect(useCallback(() => {
    let atual = true;
    if (usuarioId) consultarCurtidas(visitaId, usuarioId).then(valor => {
      if (atual) { setCurtidas(valor); setErro(''); }
    }).catch(() => { if (atual) setErro('Não foi possível atualizar as curtidas.'); });
    return () => { atual = false; };
  }, [visitaId, usuarioId, tentativa]));

  async function curtir() {
    if (!curtidas || !usuarioId || trava.current) return;
    trava.current = true;
    setOcupado(true);
    setErro('');
    const desejada = !curtidas.curtida;
    try {
      await definirCurtida(visitaId, usuarioId, desejada);
      if (ativo.current) setCurtidas({ ...curtidas, curtida: desejada, total: Math.max(0, curtidas.total + (desejada ? 1 : -1)) });
    } catch {
      if (ativo.current) setErro('Não foi possível confirmar a curtida. Atualize antes de tentar novamente.');
    } finally {
      trava.current = false;
      if (ativo.current) { setOcupado(false); tentar(valor => valor + 1); }
    }
  }

  return (
    <View style={estilosAcoes.barra}>
      <View style={estilosAcoes.linha}>
        <Pressable accessibilityRole="button"
          accessibilityLabel={`${curtidas?.curtida ? 'Descurtir visita' : 'Curtir visita'}${curtidas ? `, ${curtidas.total} curtidas` : ''}`}
          accessibilityState={{ selected: curtidas?.curtida ?? false, disabled: ocupado || !curtidas }}
          disabled={ocupado || !curtidas} onPress={curtir}
          style={({ pressed }) => [estilosAcoes.botao, curtidas?.curtida && estilosAcoes.ativo, (pressed || ocupado || !curtidas) && estilosAcoes.atenuado]}>
          <Icone nome={curtidas?.curtida ? 'curtido' : 'curtir'} tamanho={20} cor={curtidas?.curtida ? '#A54332' : paleta.petroleo} />
          <Text style={[estilosAcoes.rotulo, curtidas?.curtida && estilosAcoes.rotuloAtivo]}>
            {curtidas?.total ?? '…'}{compacto ? '' : curtidas?.total === 1 ? ' curtida' : ' curtidas'}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button"
          accessibilityLabel={`Abrir comentários${curtidas ? ` (${curtidas.comentarios})` : ''}`}
          onPress={() => abrir(true)}
          style={({ pressed }) => [estilosAcoes.botao, pressed && estilosAcoes.atenuado]}>
          <Icone nome="comentar" tamanho={20} />
          <Text style={estilosAcoes.rotulo}>
            {compacto ? curtidas?.comentarios ?? '…' : `Comentários${curtidas ? ` (${curtidas.comentarios})` : ''}`}
          </Text>
        </Pressable>
        <View style={estilosAcoes.salvar}><BotaoFavorito visitaId={visitaId} compacto={compacto} /></View>
      </View>
      {!!erro && <Pressable accessibilityRole="button" disabled={ocupado} onPress={() => tentar(valor => valor + 1)}><Text accessibilityLiveRegion="polite" style={visual.subtitle}>{erro} Toque para atualizar.</Text></Pressable>}
      {aberto && usuarioId && <Comentarios key={`${visitaId}/${usuarioId}`} visitaId={visitaId} usuarioId={usuarioId} fechar={() => abrir(false)} onAlterar={() => tentar(valor => valor + 1)} />}
    </View>
  );
}

const estilosAcoes = StyleSheet.create({
  barra: { borderTopWidth: 1, borderColor: paleta.borda, paddingHorizontal: 10, paddingVertical: 6 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 6, rowGap: 4 },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    minHeight: 44, minWidth: 44, paddingHorizontal: 8, borderRadius: 12, maxWidth: '100%',
  },
  rotulo: { color: paleta.petroleo, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  ativo: { backgroundColor: paleta.coralClaro },
  rotuloAtivo: { color: '#A54332' },
  atenuado: { opacity: 0.55 },
  salvar: { marginLeft: 'auto', maxWidth: '100%' },
});

function novoId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, letra => {
    const valor = Math.floor(Math.random() * 16);
    return (letra === 'x' ? valor : (valor & 3) | 8).toString(16);
  });
}

function Comentarios({ visitaId, usuarioId, fechar, onAlterar }: { visitaId: string; usuarioId: string; fechar: () => void; onAlterar: () => void }) {
  const [lista, setLista] = useState<ComentarioPublicacao[]>([]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const pagina = useRef(0);
  const trava = useRef(false);
  const ativo = useRef(true);
  const rascunho = useRef({ id: novoId(), texto: '' });
  const textoSalvo = useRascunho(`passaporte:rascunho:${usuarioId}:comentario:${visitaId}`,
    { texto, comentarioId: rascunho.current.id }, dados => {
      setTexto(dados.texto);
      rascunho.current = { id: dados.comentarioId, texto: dados.texto.trim() };
    });

  useEffect(() => {
    ativo.current = true;
    void carregar(true);
    return () => { ativo.current = false; };
  }, []);

  async function carregar(reiniciar = false) {
    if (trava.current) return;
    trava.current = true;
    setCarregando(true);
    setErro('');
    const proxima = reiniciar ? 0 : pagina.current;
    try {
      const dados = await listarComentarios(visitaId, proxima);
      if (!ativo.current) return;
      setLista(anteriores => reiniciar ? dados : Array.from(new Map([...anteriores, ...dados].map(item => [item.id, item])).values()));
      pagina.current = proxima + 1;
      setTemMais(dados.length === 20);
    } catch {
      if (ativo.current) setErro('Não foi possível carregar os comentários.');
    } finally {
      trava.current = false;
      if (ativo.current) setCarregando(false);
    }
  }

  async function enviar() {
    const conteudo = texto.trim();
    if (!conteudo || trava.current || !textoSalvo.pronto) return;
    trava.current = true;
    setSalvando(true);
    setErro('');
    if (rascunho.current.texto !== conteudo) rascunho.current = { id: novoId(), texto: conteudo };
    try {
      await textoSalvo.guardarAgora({ texto: conteudo, comentarioId: rascunho.current.id });
      const comentario = await enviarComentario(rascunho.current.id, visitaId, usuarioId, conteudo);
      if (!ativo.current) return;
      setLista(anteriores => [comentario, ...anteriores.filter(item => item.id !== comentario.id)]);
      setTexto('');
      rascunho.current = { id: novoId(), texto: '' };
      await textoSalvo.limpar();
      textoSalvo.reiniciar();
      onAlterar();
    } catch {
      if (ativo.current) setErro('Não foi possível confirmar o comentário. Seu texto foi mantido para tentar novamente.');
    } finally {
      trava.current = false;
      if (ativo.current) setSalvando(false);
    }
  }

  async function apagar(id: string) {
    if (trava.current) return;
    trava.current = true;
    setSalvando(true);
    setErro('');
    try {
      await removerComentario(id, usuarioId);
      if (ativo.current) setLista(anteriores => anteriores.filter(item => item.id !== id));
      onAlterar();
    } catch {
      if (ativo.current) setErro('Não foi possível apagar o comentário. Tente novamente.');
    } finally {
      trava.current = false;
      if (ativo.current) setSalvando(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={fechar}>
      <SafeAreaView style={visual.screen}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text accessibilityRole="header" style={visual.section}>Comentários</Text>
            <Pressable accessibilityRole="button" onPress={fechar} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={visual.link}>Fechar</Text></Pressable>
          </View>
          <FlatList data={lista} keyExtractor={item => item.id} contentContainerStyle={visual.content} keyboardShouldPersistTaps="handled"
            refreshing={carregando} onRefresh={() => void carregar(true)}
            ListEmptyComponent={carregando ? <ActivityIndicator color={paleta.petroleo} /> : <Text style={visual.subtitle}>Seja a primeira pessoa a comentar.</Text>}
            renderItem={({ item }) => <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: paleta.borda }}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${item.perfis?.nome ?? 'Viajante'}`} onPress={() => { fechar(); router.push({ pathname: './perfil-publico', params: { id: item.usuario_id } }); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 48 }}>
                <Avatar nome={item.perfis?.nome ?? 'Viajante'} caminho={item.perfis?.avatar_path} tamanho={36} />
                <Text style={[visual.section, { flex: 1, minWidth: 0 }]}>{item.perfis?.nome ?? 'Viajante'}</Text>
              </Pressable>
              <Text style={visual.meta}>{new Date(item.criado_em).toLocaleString('pt-BR')}</Text>
              <Text style={visual.subtitle}>{item.texto}</Text>
              {item.usuario_id === usuarioId && <Pressable accessibilityRole="button" disabled={salvando || carregando} onPress={() => void apagar(item.id)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Apagar meu comentário</Text></Pressable>}
            </View>}
            ListFooterComponent={<View>
              {!!erro && <Pressable accessibilityRole="button" disabled={carregando || salvando} onPress={() => void carregar(true)}><Text accessibilityLiveRegion="polite" style={visual.subtitle}>{erro} Toque para atualizar a lista.</Text></Pressable>}
              {temMais && <Pressable accessibilityRole="button" disabled={carregando || salvando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais comentários</Text></Pressable>}
            </View>}
          />
          <View style={{ paddingHorizontal: 22, paddingBottom: 12, borderTopWidth: 1, borderColor: paleta.borda }}>
            <TextInput accessibilityLabel="Seu comentário" placeholder="Escreva um comentário…" placeholderTextColor={paleta.suave}
              value={texto} onChangeText={setTexto} editable={!salvando && textoSalvo.pronto} multiline maxLength={500}
              style={{ color: paleta.tinta, fontFamily: 'Manrope', minHeight: 50, maxHeight: 120, paddingVertical: 12 }} />
            <Text style={visual.meta}>{texto.length}/500</Text>
            {!!texto && textoSalvo.restaurado && <Text style={visual.meta}>Texto do rascunho recuperado.</Text>}
            {textoSalvo.falha && <Text style={visual.meta}>Não foi possível guardar o rascunho neste aparelho.</Text>}
            <Pressable accessibilityRole="button" disabled={!texto.trim() || salvando || carregando || !textoSalvo.pronto} onPress={enviar}
              style={[visual.button, (!texto.trim() || salvando || carregando || !textoSalvo.pronto) && { opacity: 0.5 }]}>
              <Text style={visual.buttonText}>{salvando ? 'Aguarde…' : 'Enviar comentário'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
