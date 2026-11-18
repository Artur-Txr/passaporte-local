import { paleta } from '../lib/paleta';
import { Redirect, router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../componentes/Texto';
import { useAutenticacao } from '../contextos/AutenticacaoContext';

const foto = require('../../assets/identidade/pelourinho.webp');

export default function Welcome() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { sessao, carregando, erro, recuperandoSenha } = useAutenticacao();
  const largura = Math.min(width, 600);
  const alturaDisponivel = Math.max(0, height - insets.top - insets.bottom);
  const compacto = largura < 360;
  const margem = compacto ? 20 : 24;
  const espacoPainel = (compacto ? 370 : 365) * Math.max(1, fontScale);
  const alturaFoto = Math.min(620, Math.max(200, Math.min(
    alturaDisponivel * (fontScale > 1.25 ? 0.42 : 0.52),
    alturaDisponivel - espacoPainel,
  )));

  if (!carregando && sessao && recuperandoSenha) return <Redirect href="/recuperar-senha" />;
  if (!carregando && sessao && !erro) return <Redirect href="/inicio" />;

  return <SafeAreaView style={estilos.tela}>
    <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
      <View style={[estilos.abertura, { width: largura, minHeight: alturaDisponivel }]}>
        <View style={[estilos.foto, { height: alturaFoto }]}>
          <Image source={foto} accessibilityLabel="Casario do Pelourinho em Salvador" resizeMode="cover" style={{ width: '100%', height: '100%' }} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#0D2B3626' }]} />
          <Image accessible={false} source={require('../../assets/identidade/sombra-boas-vindas.png')} style={estilos.sombra} resizeMode="stretch" />
          <Image source={require('../../assets/identidade/logo-boas-vindas.png')} accessibilityLabel="Passaporte Local"
            style={[estilos.logo, { left: margem, width: compacto ? 205 : 240, height: compacto ? 62 : 72 }]} resizeMode="contain" />
          <View style={[estilos.local, { left: margem, right: margem }]}>
            <View style={estilos.pinFundo}><Image accessible={false} source={require('../../assets/identidade/pin-boas-vindas.png')} style={estilos.pin} /></View>
            <View style={{ flex: 1 }}><Text style={estilos.nomeLocal}>Pelourinho</Text><Text style={estilos.cidade}>Salvador · Bahia</Text></View>
          </View>
        </View>
        <View style={[estilos.painel, { paddingHorizontal: margem, minHeight: Math.max(0, alturaDisponivel - alturaFoto + 28) }]}>
          <View>
            <View style={estilos.identificador}><View style={estilos.traco} /><Text style={estilos.chamada}>Seu diário de descobertas</Text></View>
            <Text accessibilityRole="header" style={[estilos.titulo, compacto && { fontSize: 29, lineHeight: 35 }]}>{'Cada lugar, uma\nparte da sua história.'}</Text>
            <Text style={estilos.subtitulo}>Do café de todo dia à próxima viagem. Colecione lugares, cultura e lembranças.</Text>
          </View>
          <View style={estilos.acoes}>
            {!!erro && <Text accessibilityLiveRegion="polite" style={estilos.erro}>{erro}</Text>}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: carregando, busy: carregando }} disabled={carregando}
              onPress={() => router.push('/cadastro')} style={({ pressed }) => [estilos.botao, (pressed || carregando) && { opacity: 0.7 }]}>
              <Text style={estilos.textoBotao}>{carregando ? 'Carregando…' : 'Criar minha conta'}</Text>
              <Image accessible={false} source={require('../../assets/identidade/seta-boas-vindas.png')} style={estilos.seta} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Já tenho conta. Entrar" accessibilityState={{ disabled: carregando }} disabled={carregando}
              onPress={() => router.push('/login')} style={({ pressed }) => [estilos.link, (pressed || carregando) && { opacity: 0.7 }]}>
              <Text style={estilos.textoLink}>Já tenho conta <Text style={estilos.entrar}>· Entrar</Text></Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: paleta.papel },
  conteudo: { flexGrow: 1, alignItems: 'center' },
  abertura: { flexGrow: 1 },
  foto: { overflow: 'hidden', backgroundColor: paleta.petroleo },
  sombra: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  logo: { position: 'absolute', top: 24 },
  local: { position: 'absolute', bottom: 54, flexDirection: 'row', gap: 10, alignItems: 'center' },
  pinFundo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF1F', borderWidth: 1, borderColor: '#FFFFFF52' },
  pin: { width: 20, height: 20 },
  nomeLocal: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', lineHeight: 21 },
  cidade: { color: '#FFFFFF', fontSize: 13, lineHeight: 19, marginTop: 2 },
  painel: { flexGrow: 1, marginTop: -28, backgroundColor: paleta.papel, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 28, paddingBottom: 12 },
  identificador: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  traco: { width: 20, height: 3, borderRadius: 2, backgroundColor: paleta.coral },
  chamada: { flexShrink: 1, color: paleta.petroleo, fontSize: 10, lineHeight: 16, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  titulo: { color: paleta.petroleo, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1, marginTop: 14, marginBottom: 12 },
  subtitulo: { color: '#465D68', fontSize: 16, lineHeight: 25 },
  acoes: { marginTop: 'auto', paddingTop: 28 },
  botao: { minHeight: 56, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: paleta.petroleo },
  textoBotao: { color: '#FFFFFF', fontSize: 16, lineHeight: 22, fontWeight: '800', flexShrink: 1 },
  seta: { width: 20, height: 20 },
  link: { minHeight: 48, marginTop: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  textoLink: { color: '#465D68', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  entrar: { color: paleta.petroleo, fontWeight: '800' },
  erro: { color: '#9B4028', fontSize: 14, lineHeight: 21, marginBottom: 12 },
});
