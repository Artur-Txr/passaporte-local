import { chaveCidade } from "../lib/cidades";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import Icone from "../componentes/Icone";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import {
  BilheteVisita,
  Decoracao,
  Logo,
  NavegacaoInferior,
  cores,
  visual,
} from "../componentes/Design";
export default function Inicio() {
  const { compacto } = useLayoutResponsivo();
  const { sessao } = useAutenticacao();
  const { visitas, carregando, erro, recarregarVisitas } = useVisitas();
  const nome =
    typeof sessao?.user.user_metadata.nome === "string"
      ? sessao.user.user_metadata.nome
      : "Viajante";
  const cidades = new Set(
    visitas.map((v) => chaveCidade(v.cidade, v.uf)),
  ).size;
  return (
    <SafeAreaView style={visual.screen}>
      <Decoracao />
      <ScrollView contentContainerStyle={visual.content}
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { if (!carregando) recarregarVisitas(); }} colors={[cores.verde]} tintColor={cores.verde} />}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Logo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Meu perfil"
            onPress={() => router.push("/perfil")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#C3CCB7",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: cores.verde }}>
              {nome
                .split(" ")
                .slice(0, 2)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </Pressable>
        </View>
        <Text style={[visual.section, { fontSize: 20, marginTop: 8 }]}>
          Olá, {nome.split(" ")[0]}
        </Text>
        <View style={{ flexDirection: compacto ? "column" : "row", alignItems: compacto ? "flex-start" : "center", gap: 8 }}>
          <Text style={[visual.title, { flex: 1 }]}>Meu passaporte</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Atualizar visitas" disabled={carregando} onPress={recarregarVisitas} style={{ paddingVertical: 12, paddingLeft: 8 }}><Text style={visual.link}>{carregando ? "Atualizando…" : "Atualizar"}</Text></Pressable>
        </View>
        <Text style={visual.subtitle}>Cada lugar, uma nova história.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir coleção de carimbos"
          onPress={() => router.push("/passaporte")}
          style={{
            backgroundColor: cores.verde,
            borderRadius: 12,
            padding: compacto ? 12 : 20,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: compacto ? 8 : 20,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("../../assets/prototipo/capa-textura.png")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "120%",
              height: "120%",
              opacity: 0.45,
            }}
            resizeMode="cover"
          />
          <Icone nome="lugar" tamanho={42} cor="#F6F1DE" />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#D6DEC9",
                fontSize: 9,
                letterSpacing: 3,
                marginBottom: 12,
              }}
            >
              PASSAPORTE LOCAL
            </Text>
            <View style={{ flexDirection: "row", gap: compacto ? 12 : 28 }}>
              <View>
                <Text
                  style={{ color: "#FFF", fontSize: 28, fontWeight: "700" }}
                >
                  {carregando && !visitas.length ? "—" : visitas.length}
                </Text>
                <Text style={{ color: "#E2E5D5", fontSize: 12 }}>{visitas.length === 1 ? "visita" : "visitas"}</Text>
              </View>
              <View
                style={{
                  borderLeftWidth: 1,
                  borderColor: "#688373",
                  paddingLeft: compacto ? 12 : 28,
                }}
              >
                <Text
                  style={{ color: "#FFF", fontSize: 28, fontWeight: "700" }}
                >
                  {carregando && !visitas.length ? "—" : cidades}
                </Text>
                <Text style={{ color: "#E2E5D5", fontSize: 12 }}>{cidades === 1 ? "cidade" : "cidades"}</Text>
              </View>
            </View>
          </View>
          {!compacto && <Image source={require("../../assets/prototipo/carimbo-brasil.png")} style={{ width: 62, height: 68 }} resizeMode="contain" />}
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <Text style={visual.section}>Últimos carimbos cadastrados</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/visitas")}
          >
            <Text style={visual.link}>Ver todas</Text>
          </Pressable>
        </View>
        {!!erro && visitas.length > 0 && <Pressable accessibilityRole="button" onPress={recarregarVisitas}><Text accessibilityLiveRegion="polite" style={visual.subtitle}>Não foi possível atualizar. Mostrando as visitas anteriores. Toque para tentar novamente.</Text></Pressable>}
        {carregando && !visitas.length ? (
          <ActivityIndicator style={{ margin: 25 }} color={cores.verde} />
        ) : erro && !visitas.length ? (
          <Pressable onPress={recarregarVisitas}>
            <Text style={visual.subtitle}>
              {erro} Toque para tentar novamente.
            </Text>
          </Pressable>
        ) : visitas.length === 0 ? (
          <Text style={[visual.subtitle, { marginTop: 20 }]}>
            Seu primeiro carimbo começa com uma visita.
          </Text>
        ) : (
          visitas
            .slice(0, 3)
            .map((v) => <BilheteVisita key={v.id} visita={v} compacto />)
        )}
        <Pressable
          accessibilityRole="button"
          disabled={carregando || !!erro}
          onPress={() => router.push("/nova-visita")}
          style={visual.button}
        >
          <Text style={visual.buttonText}>Registrar visita</Text>
        </Pressable>
      </ScrollView>
      <NavegacaoInferior ativa="inicio" />
    </SafeAreaView>
  );
}
