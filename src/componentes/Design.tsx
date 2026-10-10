import Icone from "./Icone";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { obterUrlFoto } from "../servicos/fotosService";
import type { Visita } from "../dados/visitas";

export const cores = {
  verde: "#123E34",
  papel: "#F8F5EC",
  tinta: "#12342D",
  laranja: "#BC592F",
  borda: "#DDD8CC",
  suave: "#5B635C",
};
export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  return (
    <Image
      source={require("../../assets/prototipo/logo.png")}
      accessibilityLabel="Passaporte Local"
      style={{ width: pequeno ? 112 : 160, height: pequeno ? 43 : 61 }}
      resizeMode="contain"
    />
  );
}
export function Decoracao({ paisagem = false }: { paisagem?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require("../../assets/prototipo/folhas.png")}
        style={{
          position: "absolute",
          right: 0,
          top: 50,
          width: 112,
          height: 118,
          opacity: 0.65,
        }}
        resizeMode="contain"
      />
      {paisagem && (
        <Image
          source={require("../../assets/prototipo/paisagem.png")}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 156,
          }}
          resizeMode="stretch"
        />
      )}
    </View>
  );
}
export function Cabecalho({
  titulo,
  voltar = false,
}: {
  titulo?: string;
  voltar?: boolean;
}) {
  return (
    <View style={visual.header}>
      {voltar && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/inicio")
          }
          style={{ padding: 8 }}
        >
          <Text style={{ fontSize: 30, color: cores.verde }}>‹</Text>
        </Pressable>
      )}
      {titulo && (
        <Text
          style={{
            flex: 1,
            color: cores.tinta,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          {titulo}
        </Text>
      )}
      <Logo pequeno={!!titulo} />
    </View>
  );
}
export function NavegacaoInferior({
  ativa,
}: {
  ativa: "inicio" | "visitas" | "perfil";
}) {
  return (
    <View style={visual.nav}>
      {(["inicio", "visitas", "perfil"] as const).map((item, i) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: ativa === item }}
          onPress={() => router.replace(`/${item}`)}
          style={visual.navItem}
        >
          <Icone
            nome={
              item === "inicio"
                ? "inicio"
                : item === "visitas"
                  ? "lugar"
                  : "perfil"
            }
            tamanho={24}
            cor={ativa === item ? cores.laranja : cores.suave}
          />
          <Text
            style={{
              fontSize: 11,
              color: ativa === item ? cores.laranja : cores.suave,
            }}
          >
            {["Início", "Visitas", "Perfil"][i]}
          </Text>
          <View
            style={{
              height: 2,
              width: 28,
              backgroundColor: ativa === item ? cores.laranja : "transparent",
              marginTop: 4,
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}
export function MiniFoto({ visita }: { visita: Visita }) {
  const { sessao } = useAutenticacao();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let ativa = true;
    setUrl(null);
    if (visita.foto_path && sessao)
      void obterUrlFoto(sessao.user.id, visita.foto_path)
        .then((u) => {
          if (ativa) setUrl(u);
        })
        .catch(() => {});
    return () => {
      ativa = false;
    };
  }, [visita.foto_path, sessao?.user.id]);
  return url ? (
    <Image
      source={{ uri: url }}
      style={visual.thumb}
      onError={() => setUrl(null)}
    />
  ) : (
    <View
      style={[
        visual.thumb,
        {
          backgroundColor: "#E6E7D9",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Icone nome="lugar" tamanho={36} cor="#74826A" />
      <Text style={{ color: cores.verde, fontSize: 10 }}>VISITADO</Text>
    </View>
  );
}
export function BilheteVisita({
  visita,
  compacto = false,
}: {
  visita: Visita;
  compacto?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${visita.lugar}`}
      onPress={() =>
        router.push({ pathname: "/detalhes", params: { id: visita.id } })
      }
      style={[visual.ticket, compacto && { minHeight: 82 }]}
    >
      <MiniFoto visita={visita} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontWeight: "700", color: cores.tinta }}
        >
          {visita.lugar}
        </Text>
        <Text style={visual.meta}>
          ⌖ {visita.cidade}, {visita.uf}
        </Text>
        <Text style={visual.meta}>▢ {visita.data}</Text>
        {!compacto && <Text style={visual.meta}>♧ {visita.categoria}</Text>}
      </View>
      <Text style={{ fontSize: 27, color: cores.suave }}>›</Text>
    </Pressable>
  );
}
export function Filtro({
  valor,
  opcoes,
  onChange,
}: {
  valor: string;
  opcoes: { id: string; nome: string }[];
  onChange: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setAberto(true)}
        style={visual.select}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, color: cores.tinta, fontSize: 12 }}
        >
          {opcoes.find((o) => o.id === valor)?.nome}
        </Text>
        <Text style={{ color: cores.verde }}>⌄</Text>
      </Pressable>
      <Modal
        transparent
        visible={aberto}
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable onPress={() => setAberto(false)} style={visual.overlay}>
          <View style={visual.dialog}>
            <Text style={visual.section}>Selecione uma opção</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {opcoes.map((o) => (
                <Pressable
                  key={o.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: o.id === valor }}
                  onPress={() => {
                    onChange(o.id);
                    setAberto(false);
                  }}
                  style={{
                    paddingVertical: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: cores.borda,
                  }}
                >
                  <Text style={{ color: cores.verde }}>
                    {o.id === valor ? "✓  " : ""}
                    {o.nome}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
export const visual = StyleSheet.create({
  screen: { flex: 1, backgroundColor: cores.papel },
  content: { padding: 20, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    minHeight: 62,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -1,
    color: cores.tinta,
  },
  subtitle: { fontSize: 14, color: cores.suave, lineHeight: 21, marginTop: 4 },
  section: { fontSize: 16, fontWeight: "700", color: cores.tinta },
  button: {
    backgroundColor: cores.verde,
    borderRadius: 15,
    padding: 14,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  link: { color: cores.laranja, fontSize: 12, textDecorationLine: "underline" },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.papel,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  ticket: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 8,
    marginTop: 9,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 11,
    backgroundColor: "#FCFAF3",
    minHeight: 104,
  },
  thumb: { width: 91, height: 85, borderRadius: 6 },
  meta: { fontSize: 12, color: cores.suave },
  select: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 11,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    backgroundColor: "#F3F0E7",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    backgroundColor: "#0008",
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    padding: 22,
    backgroundColor: cores.papel,
    borderRadius: 18,
  },
});
