import { paleta } from "../lib/paleta";
import { Redirect, router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../componentes/Texto";
import { useAutenticacao } from "../contextos/AutenticacaoContext";

const foto = require("../../assets/identidade/pelourinho.webp");
const alturaFoto = 447;

export default function Welcome() {
  const { width } = useWindowDimensions();
  const { sessao, carregando, erro, recuperandoSenha } = useAutenticacao();
  const largura = Math.min(width, 600);
  const tamanho = Image.resolveAssetSource(foto);
  const escala = Math.max(largura / tamanho.width, alturaFoto / tamanho.height);
  const larguraFoto = tamanho.width * escala;
  const alturaRenderizada = tamanho.height * escala;

  if (!carregando && sessao && recuperandoSenha)
    return <Redirect href="/recuperar-senha" />;
  if (!carregando && sessao && !erro) return <Redirect href="/inicio" />;

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={[estilos.abertura, { width: largura }]}>
          <View style={estilos.foto}>
            <Image
              source={foto}
              accessibilityLabel="Casario do Pelourinho em Salvador"
              style={{
                position: "absolute",
                width: larguraFoto,
                height: alturaRenderizada,
                left: (largura - larguraFoto) / 2,
                top: (alturaFoto - alturaRenderizada) * 0.62,
              }}
            />
            <Image source={require("../../assets/identidade/sombra-boas-vindas.png")} style={estilos.sombra} resizeMode="stretch" />
          </View>
          <Image
            source={require("../../assets/identidade/logo-boas-vindas.png")}
            accessibilityLabel="Passaporte Local"
            style={estilos.logo}
            resizeMode="contain"
          />
          <View style={estilos.local}>
            <Image source={require("../../assets/identidade/pin-boas-vindas.png")} style={estilos.pin} />
            <View>
              <Text style={estilos.nomeLocal}>Pelourinho</Text>
              <Text style={estilos.cidade}>Salvador · Bahia</Text>
            </View>
          </View>
          <View style={estilos.painel}>
            <Text style={estilos.chamada}>Seu diário de descobertas</Text>
            <Text accessibilityRole="header" style={estilos.titulo}>{"Cada lugar, uma\nparte da sua história."}</Text>
            <Text style={estilos.subtitulo}>{"Do café de todo dia à próxima viagem.\nColecione lugares, cultura e lembranças."}</Text>
            <Pressable accessibilityRole="button" disabled={carregando} onPress={() => router.push("/cadastro")} style={estilos.botao}>
              <Text style={estilos.textoBotao}>{carregando ? "Carregando…" : "Começar"}</Text>
              <Image source={require("../../assets/identidade/seta-boas-vindas.png")} style={estilos.seta} />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push("/login")} style={estilos.link}>
              <Text style={estilos.textoLink}>Já tenho conta</Text>
            </Pressable>
            {!!erro && <Text style={estilos.subtitulo}>{erro}</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const papel = paleta.papel;
const petroleo = paleta.petroleo;

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: papel },
  conteudo: { flexGrow: 1, alignItems: "center" },
  abertura: { flexGrow: 1 },
  foto: { position: "absolute", top: 0, left: 0, right: 0, height: alturaFoto, overflow: "hidden", backgroundColor: petroleo },
  sombra: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  logo: { position: "absolute", top: 23, left: 25, width: 240, height: 72 },
  local: { position: "absolute", top: 345, left: 25, flexDirection: "row", gap: 8, alignItems: "center" },
  pin: { width: 20, height: 20 },
  nomeLocal: { color: "#FFF", fontSize: 14, fontWeight: "700", marginBottom: 3 },
  cidade: { color: "#FFF", fontSize: 11 },
  painel: { flexGrow: 1, marginTop: 427, backgroundColor: papel, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 26, paddingHorizontal: 24, paddingBottom: 24 },
  chamada: { color: petroleo, fontSize: 9, fontWeight: "800", letterSpacing: 1.7, textTransform: "uppercase" },
  titulo: { color: paleta.tinta, fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.5, marginVertical: 12 },
  subtitulo: { color: paleta.suave, fontSize: 13, lineHeight: 21, marginBottom: 21 },
  botao: { minHeight: 50, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: petroleo },
  textoBotao: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  seta: { width: 19, height: 19 },
  link: { minHeight: 44, marginTop: 5, alignItems: "center", justifyContent: "center" },
  textoLink: { color: petroleo, fontSize: 12, fontWeight: "800" },
});
