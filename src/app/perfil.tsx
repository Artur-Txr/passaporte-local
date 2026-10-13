import { Dialogo } from "../componentes/Design";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import Icone from '../componentes/Icone';
import CartaoCidade from '../componentes/CartaoCidade';
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import {
  Cabecalho,
  Decoracao,
  NavegacaoInferior,
  cores,
  visual,
} from "../componentes/Design";
export default function Perfil() {
  const { compacto } = useLayoutResponsivo();
  const { sessao, carregando, sair } = useAutenticacao();
  const { visitas, carregando: carregandoVisitas, erro } = useVisitas();
  const [saindo, setSaindo] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [falha, setFalha] = useState("");
  const emAndamento = useRef(false);
  if (carregando)
    return (
      <SafeAreaView style={visual.screen}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  if (!sessao) return <Redirect href="/login" />;
  const nome =
    typeof sessao.user.user_metadata.nome === "string"
      ? sessao.user.user_metadata.nome
      : "Viajante";
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  const cidades = Array.from(
    new Map(
      visitas.map((v) => [
        `${v.cidade.trim().toLowerCase()}|${v.uf}`,
        `${v.cidade} · ${v.uf}`,
      ]),
    ).values(),
  );
  async function encerrar() {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setSaindo(true);
    try {
      await sair();
    } catch {
      setFalha("Não foi possível sair. Confira sua conexão.");
    } finally {
      emAndamento.current = false;
      setSaindo(false);
      setConfirmar(false);
    }
  }
  return (
    <SafeAreaView style={visual.screen}>
      <Decoracao />
      <ScrollView contentContainerStyle={visual.content}>
        <Cabecalho alinharInicio />
        <Text style={visual.title}>Meu perfil</Text>
        <Text style={visual.subtitle}>Meu passaporte pessoal</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginVertical: 20,
          }}
        >
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor: cores.laranja,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 27, fontWeight: "700" }}>
              {iniciais}
            </Text>
          </View>
          <Text style={[visual.section, { fontSize: 19, flex: 1 }]}>
            {nome}
          </Text>
        </View>
        <View style={{ flexDirection: compacto ? "column" : "row", gap: 10, marginBottom: 20 }}>
          {[
            ["lugar", carregandoVisitas || erro ? "—" : visitas.length, "visitas"],
            ["cidade", carregandoVisitas || erro ? "—" : cidades.length, "cidades"],
          ].map(([icone, n, rotulo]) => (
            <View
              key={rotulo}
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: "#EEEDE2",
                borderRadius: 10,
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: rotulo === "cidades" ? "#F1DDC9" : "#DFE8D8", alignItems: "center", justifyContent: "center" }}><Icone nome={rotulo === "cidades" ? "cidade" : "lugar"} tamanho={25} cor={rotulo === "cidades" ? cores.laranja : cores.verde} /></View>
              <View>
                <Text style={[visual.section, { fontSize: 22 }]}>{n}</Text>
                <Text style={visual.meta}>{rotulo}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={visual.section}>Minha conta</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: cores.borda,
            borderRadius: 10,
            marginTop: 10,
            paddingHorizontal: 13,
          }}
        >
          {[
            ["Nome", nome],
            ["E-mail", sessao.user.email ?? "Não informado"],
          ].map(([campo, valor]) => (
            <View
              key={campo}
              style={{
                flexDirection: compacto ? "column" : "row",
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: campo.includes("Nome") ? 1 : 0,
                borderColor: cores.borda,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><Icone nome={campo === "Nome" ? "perfil" : "email"} tamanho={18} cor={cores.suave} /><Text style={visual.meta}>{campo}</Text></View>
              <Text style={[visual.meta, { flex: 1, minWidth: 0, textAlign: compacto ? "left" : "right" }]}>
                {valor}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[visual.section, { marginTop: 20 }]}>
          Cidades no passaporte
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 12,
          }}
        >
          {cidades.map((cidade, i) => <CartaoCidade key={cidade} nome={cidade} indice={i} />)}
        </View>
        {!cidades.length && (
          <Text style={visual.subtitle}>
            Suas cidades aparecerão após a primeira visita.
          </Text>
        )}
        {!!falha && (
          <Text style={{ color: cores.laranja, marginTop: 12 }}>{falha}</Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={saindo}
          onPress={() => setConfirmar(true)}
          style={{
            borderWidth: 1,
            borderColor: cores.laranja,
            borderRadius: 13,
            padding: 13,
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <Text style={{ color: cores.laranja, fontWeight: "600" }}>
            {saindo ? "Saindo..." : "Sair da conta"}
          </Text>
        </Pressable>
      </ScrollView>
      <NavegacaoInferior ativa="perfil" />
      <Modal
        visible={confirmar}
        transparent
        animationType="fade"
        onRequestClose={() => !saindo && setConfirmar(false)}
      >
        <View style={visual.overlay}>
          <Dialogo>
            <Text style={[visual.section, { textAlign: "center" }]}>
              Sair da conta?
            </Text>
            <Text style={[visual.subtitle, { textAlign: "center" }]}>
              Você precisará entrar novamente para acessar seu passaporte.
            </Text>
            <Pressable
              disabled={saindo}
              onPress={() => setConfirmar(false)}
              style={visual.button}
            >
              <Text style={visual.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={saindo}
              onPress={encerrar}
              style={[visual.button, { backgroundColor: cores.laranja }]}
            >
              <Text style={visual.buttonText}>
                {saindo ? "Saindo..." : "Sair"}
              </Text>
            </Pressable>
          </Dialogo>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
