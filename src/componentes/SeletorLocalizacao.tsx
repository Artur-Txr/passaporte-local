import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { coordenadasValidas, type Coordenadas, type LugarEncontrado } from '../lib/mapa';
import { buscarLugares } from '../servicos/buscaLocalService';
import { obterLocalizacaoAtual } from '../servicos/localizacaoAtualService';
import CampoTexto from './CampoTexto';
import { visual } from './Design';
import MapaInterativo from './MapaInterativo';
import Text from './Texto';

export default function SeletorLocalizacao({ valor, onChange, bloqueado, buscaInicial = '' }: {
  valor: Coordenadas | null;
  onChange: (valor: Coordenadas | null) => void;
  bloqueado: boolean;
  buscaInicial?: string;
}) {
  const [aberto, abrir] = useState(false);
  const [escolha, escolher] = useState<Coordenadas | null>(valor);
  const [centro, centralizar] = useState<Coordenadas | null>(valor);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<LugarEncontrado[]>([]);
  const [pesquisou, setPesquisou] = useState(false);
  const [ocupado, setOcupado] = useState<'gps' | 'busca' | null>(null);
  const [erro, setErro] = useState('');
  const [erroMapa, setErroMapa] = useState(false);
  const [precisao, setPrecisao] = useState<number | null>(null);
  const [tentativa, tentar] = useState(0);
  const versao = useRef(0);
  const trava = useRef(false);
  useEffect(() => () => { versao.current++; }, []);
  const marcadores = useMemo(() => centro ? [{ ...centro, id: 'local', titulo: 'Local da visita' }] : [], [centro]);
  function cancelarOperacao() { versao.current++; trava.current = false; setOcupado(null); }
  function fechar() { cancelarOperacao(); Keyboard.dismiss(); abrir(false); }
  function marcar(ponto: Coordenadas, moverMapa: boolean) {
    cancelarOperacao(); escolher(ponto); setPrecisao(null); setErro('');
    setResultados([]); setPesquisou(false);
    if (moverMapa) centralizar(ponto);
  }
  async function pesquisar() {
    if (trava.current) return;
    if (busca.trim().length < 3) { setErro('Digite pelo menos 3 caracteres para buscar.'); return; }
    Keyboard.dismiss(); trava.current = true;
    const consulta = ++versao.current;
    setOcupado('busca'); setErro(''); setResultados([]); setPesquisou(false);
    try {
      const locais = await buscarLugares(busca);
      if (consulta === versao.current) { setResultados(locais); setPesquisou(true); }
    } catch {
      if (consulta === versao.current) setErro('Não foi possível buscar esse lugar. Confira a conexão e tente novamente.');
    } finally {
      if (consulta === versao.current) { trava.current = false; setOcupado(null); }
    }
  }
  async function localizar() {
    if (trava.current) return;
    Keyboard.dismiss(); trava.current = true;
    const consulta = ++versao.current;
    setOcupado('gps'); setErro('');
    try {
      const ponto = await obterLocalizacaoAtual();
      if (consulta !== versao.current) return;
      const coordenadas = { latitude: ponto.latitude, longitude: ponto.longitude };
      escolher(coordenadas); centralizar(coordenadas); setPrecisao(ponto.precisao);
      setResultados([]); setPesquisou(false);
    } catch (falha) {
      if (consulta === versao.current) setErro(falha instanceof Error ? falha.message : 'Não foi possível obter sua posição. Tente novamente.');
    } finally {
      if (consulta === versao.current) { trava.current = false; setOcupado(null); }
    }
  }
  return <View style={{ marginVertical: 16 }}>
    <Text style={visual.section}>Localização no mapa (opcional)</Text>
    <Text style={visual.subtitle}>{valor ? 'Localização marcada para esta visita.' : 'Use sua posição atual, busque um lugar ou marque no mapa.'}</Text>
    <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => {
      cancelarOperacao(); escolher(valor); centralizar(valor); setBusca(buscaInicial.trim());
      setResultados([]); setPesquisou(false); setErro(''); setErroMapa(false); setPrecisao(null); abrir(true);
    }} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={visual.link}>{valor ? 'Alterar localização' : 'Selecionar localização'}</Text></Pressable>
    {valor && <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => onChange(null)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Remover localização</Text></Pressable>}
    {aberto && <Modal visible animationType="slide" onRequestClose={fechar}>
      <SafeAreaView style={visual.screen}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text accessibilityRole="header" style={visual.section}>Onde fica o lugar?</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}><CampoTexto icone="busca" accessibilityLabel="Nome do lugar ou endereço" placeholder="Lugar, endereço ou cidade" value={busca} maxLength={160} returnKeyType="search" onSubmitEditing={() => void pesquisar()} onChangeText={texto => { cancelarOperacao(); setBusca(texto); setResultados([]); setPesquisou(false); setErro(''); }} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, paddingRight: 10, marginVertical: 8 }} /></View>
            <Pressable accessibilityRole="button" disabled={!!ocupado} onPress={() => void pesquisar()} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 }}><Text style={visual.link}>Buscar</Text></Pressable>
          </View>
          <Pressable accessibilityRole="button" disabled={!!ocupado} onPress={() => void localizar()} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Usar localização atual</Text></Pressable>
          {!!ocupado && <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 8 }}><ActivityIndicator /><Text style={visual.meta}>{ocupado === 'gps' ? 'Obtendo sua posição…' : 'Buscando lugares…'}</Text></View>}
          {!!erro && <Text accessibilityRole="alert" style={visual.subtitle}>{erro}</Text>}
          {pesquisou && !resultados.length && <Text style={visual.subtitle}>Nenhum lugar encontrado. Inclua a cidade ou marque o ponto no mapa.</Text>}
          {!!resultados.length && <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
            {resultados.map(local => <Pressable key={local.id} accessibilityRole="button" onPress={() => { Keyboard.dismiss(); marcar(local, true); }} style={{ paddingVertical: 12 }}><Text style={visual.section}>{local.nome}</Text><Text style={visual.meta}>{local.endereco}</Text></Pressable>)}
          </ScrollView>}
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => setErro('Não foi possível abrir o link.'))}><Text style={visual.meta}>Busca Photon · © OpenStreetMap</Text></Pressable>
          <Text style={[visual.meta, { paddingVertical: 6 }]}>Toque no mapa para ajustar o ponto.</Text>
        </View>
        <MapaInterativo key={tentativa} marcadores={marcadores} editavel onEscolher={ponto => marcar(ponto, false)} onErro={() => setErroMapa(true)} />
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {erroMapa && <Pressable accessibilityRole="button" onPress={() => { setErroMapa(false); centralizar(escolha); tentar(v => v + 1); }}><Text style={visual.link}>Falha ao carregar o mapa. Tentar novamente.</Text></Pressable>}
          {escolha && <Text style={[visual.meta, { marginTop: 6 }]}>{escolha.latitude.toFixed(5)}, {escolha.longitude.toFixed(5)}{precisao !== null ? ` · Precisão de aproximadamente ${Math.ceil(precisao)} m` : ''}</Text>}
          <Pressable accessibilityRole="button" disabled={!coordenadasValidas(escolha) || !!ocupado} onPress={() => { if (coordenadasValidas(escolha)) { onChange(escolha); fechar(); } }} style={[visual.button, (!escolha || ocupado) && { opacity: 0.5 }]}><Text style={visual.buttonText}>Confirmar localização</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={fechar} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={visual.link}>Cancelar</Text></Pressable>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>}
  </View>;
}
