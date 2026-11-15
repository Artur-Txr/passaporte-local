import BotaoNotificacoes from '../componentes/BotaoNotificacoes';
import { paleta } from "../lib/paleta";
import Text from "../componentes/Texto";
import Avatar from '../componentes/Avatar';
import AtalhosPessoais from '../componentes/AtalhosPessoais';
import usePerfilAtual from '../componentes/usePerfilAtual';
import { agruparCidades } from "../lib/cidades";
import { Dialogo } from "../componentes/Design";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import Icone from '../componentes/Icone';
import CartaoCidade from '../componentes/CartaoCidade';
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,

  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import {
  Decoracao,
  NavegacaoInferior,
  cores,
  visual,
} from "../componentes/Design";
export default function Perfil() {
  const perfilAtual = usePerfilAtual();
  const { emailPendente } = useLocalSearchParams<{ emailPendente?: string }>();
  const { compacto } = useLayoutResponsivo();
  const { sessao, carregando, sair } = useAutenticacao();
  const { visitas, erro, recarregarVisitas } = useVisitas();
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
  const todas = [...visitas];
  const cidades = agruparCidades(todas);
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
        <Text style={[visual.meta, { color: paleta.petroleo, fontWeight: "800", letterSpacing: 1.2 }]}>SEU DIÁRIO TEM A SUA CARA</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text accessibilityRole="header" style={[visual.title, { flex: 1 }]}>Meu perfil</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginLeft: 8 }}><BotaoNotificacoes />
          <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={() => router.push("./editar-perfil")} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: paleta.borda }}>
            <Icone nome="editar" tamanho={22} />
          </Pressable></View>
        </View>
        {emailPendente === "1" && (
          <Text accessibilityLiveRegion="polite" style={visual.subtitle}>
            Confira sua caixa de entrada para confirmar a mudança de e-mail.
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginVertical: 20,
          }}
        >
          <Avatar nome={nome} caminho={perfilAtual?.avatar_path} tamanho={66} />
          <View style={{ flex: 1 }}>
            <Text style={[visual.section, { fontSize: 19 }]}>{nome}</Text>
            <Text style={visual.meta}>{sessao.user.email}</Text>
          </View>
        </View>
        <View style={{ flexDirection: compacto ? "column" : "row", gap: 10, marginBottom: 20 }}>
          {[
            ["lugar", todas.length, "visitas"],
            ["cidade", cidades.length, "cidades"],
          ].map(([icone, n, rotulo]) => (
            <View
              key={rotulo}
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: paleta.claro,
                borderRadius: 10,
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: rotulo === "cidades" ? paleta.coralClaro : paleta.claro, alignItems: "center", justifyContent: "center" }}><Icone nome={rotulo === "cidades" ? "cidade" : "lugar"} tamanho={25} cor={rotulo === "cidades" ? cores.laranja : cores.verde} /></View>
              <View>
                <Text style={[visual.section, { fontSize: 22 }]}>{n}</Text>
                <Text style={visual.meta}>{n === 1 ? String(rotulo).replace(/s$/, "") : rotulo}</Text>
              </View>
            </View>
          ))}
        </View>
        {!!erro && <Pressable accessibilityRole="button" onPress={recarregarVisitas}><Text accessibilityLiveRegion="polite" style={visual.subtitle}>Não foi possível atualizar suas visitas. Toque para tentar novamente.</Text></Pressable>}
        <AtalhosPessoais />
        <Pressable accessibilityRole="button" onPress={() => router.push('./sobre')} style={{ minHeight: 44, justifyContent: 'center', marginBottom: 12 }}>
          <Text style={visual.link}>Sobre o aplicativo</Text>
        </Pressable>
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
        <Text style={visual.subtitle}>Revisite suas histórias por cidade.</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 12,
          }}
        >
          {cidades.map(cidade => <CartaoCidade key={cidade.chave} nome={cidade.nome} visita={cidade.visita} quantidade={cidade.quantidade} localidades={cidade.localidades} unico />)}
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
