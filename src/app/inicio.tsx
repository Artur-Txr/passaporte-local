import BotaoNotificacoes from '../componentes/BotaoNotificacoes';
import { paleta } from "../lib/paleta";
import Text from "../componentes/Texto";
import Avatar from '../componentes/Avatar';
import AtalhosPessoais from '../componentes/AtalhosPessoais';
import usePerfilAtual from '../componentes/usePerfilAtual';
import BotaoAtualizar from "../componentes/BotaoAtualizar";
import { chaveCidade, rotuloCidade } from "../lib/cidades";
import { compararDatasVisitas } from "../lib/formatacaoData";
import { formatarDataVisita } from "../lib/formatacaoData";
import useFotoPrivada from "../componentes/useFotoPrivada";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import Icone from "../componentes/Icone";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,

  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import {
  BilheteVisita,
  Decoracao,
  NavegacaoInferior,
  cores,
  visual,
} from "../componentes/Design";
export default function Inicio() {
  const perfilAtual = usePerfilAtual();
  const { compacto } = useLayoutResponsivo();
  const { sessao } = useAutenticacao();
  const { visitas, carregando, erro, recarregarVisitas } = useVisitas();
  const nome =
    typeof sessao?.user.user_metadata.nome === "string"
      ? sessao.user.user_metadata.nome
      : "Viajante";
  const todas = [...visitas].sort((a, b) => compararDatasVisitas(b.data, a.data));
  const [destaque, ...recentes] = todas.slice(0, 3);
  const { url: fotoDestaque } = useFotoPrivada(destaque?.foto_path ?? null);
  const cidades = new Set(
    todas.map((v) => chaveCidade(v.cidade, v.uf)),
  ).size;
  const abrir = (visita: (typeof todas)[number]) => {
    router.push({ pathname: "/detalhes", params: { id: visita.id } });
  };
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
          <View style={{ flex: 1 }}>
            <Text style={visual.subtitle}>Olá, {nome.split(" ")[0]}</Text>
            <Text accessibilityRole="header" style={visual.title}>Meu passaporte</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
          <BotaoNotificacoes />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Meu perfil"
            onPress={() => router.push("/perfil")}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: paleta.coral,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar nome={nome} caminho={perfilAtual?.avatar_path} tamanho={48} />
          </Pressable>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver minhas visitas"
          onPress={() => router.push("/visitas")}
          style={{
            backgroundColor: cores.verde,
            borderRadius: 22,
            padding: compacto ? 12 : 20,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: compacto ? 8 : 20,
            overflow: "hidden",
          }}
        >

          <Icone nome="lugar" tamanho={42} cor={paleta.papel} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: paleta.claro,
                fontSize: 9,
                letterSpacing: 3,
                marginBottom: 12,
              }}
            >
              COLEÇÃO DE LUGARES VIVIDOS
            </Text>
            <View style={{ flexDirection: compacto ? "column" : "row", gap: compacto ? 12 : 28 }}>
              <View>
                <Text
                  style={{ color: "#FFF", fontSize: 28, fontWeight: "700" }}
                >
                  {todas.length}
                </Text>
                <Text style={{ color: paleta.claro, fontSize: 12 }}>visitas guardadas</Text>
              </View>
              <View
                style={{
                  borderLeftWidth: compacto ? 0 : 1,
                  borderTopWidth: compacto ? 1 : 0,
                  borderColor: "#587783",
                  paddingTop: compacto ? 12 : 0,
                  paddingLeft: compacto ? 0 : 28,
                }}
              >
                <Text
                  style={{ color: "#FFF", fontSize: 28, fontWeight: "700" }}
                >
                  {cidades}
                </Text>
                <Text style={{ color: paleta.claro, fontSize: 12 }}>cidades conhecidas</Text>
              </View>
            </View>
          </View>
          <Icone nome="proximo" tamanho={24} cor={paleta.coral} />
        </Pressable>
        <AtalhosPessoais />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <Text style={visual.section}>Últimas descobertas</Text>
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
        ) : !destaque ? (
          <Text style={[visual.subtitle, { marginTop: 20 }]}>
            A primeira história ainda está por vir.
          </Text>
        ) : null}
        {destaque && (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${destaque.lugar}`} onPress={() => abrir(destaque)}
              style={{ height: 190, backgroundColor: paleta.petroleo, borderRadius: 18, overflow: "hidden", justifyContent: "flex-end", marginVertical: 12 }}>
              {fotoDestaque && (
                <Image source={{ uri: fotoDestaque ?? undefined }}
                  style={{ position: "absolute", width: "100%", height: "100%" }} />
              )}
              <Text style={{ position: "absolute", top: 12, right: 12, backgroundColor: paleta.papel, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, color: paleta.petroleo, fontSize: 12 }}>
                {formatarDataVisita(destaque.data)}
              </Text>
              <View style={{ backgroundColor: "#0D2B36E6", padding: 12 }}>
                <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "800" }}>{destaque.lugar}</Text>
                <Text style={{ color: paleta.claro, fontSize: 12 }}>{rotuloCidade(destaque.cidade, destaque.uf)}</Text>
              </View>
            </Pressable>
            {recentes.map((visita) => (
              <BilheteVisita key={visita.id} visita={visita} compacto aoAbrir={() => abrir(visita)} />
            ))}
          </>
        )}
        {!!erro && <BotaoAtualizar carregando={carregando} onPress={recarregarVisitas} />}
      </ScrollView>
      <View style={{ width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 22, paddingBottom: 8 }}>
        <Pressable
          accessibilityRole="button"
          disabled={carregando || !!erro}
          onPress={() => router.push("/nova-visita")}
          style={visual.button}
        >
          <Text style={visual.buttonText}>Registrar visita</Text>
        </Pressable>
      </View>
      <NavegacaoInferior ativa="inicio" />
    </SafeAreaView>
  );
}
