import type { ReactNode } from "react";
import useLayoutResponsivo from "./useLayoutResponsivo";
import { formatarDataVisita } from "../lib/formatacaoData";
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
  const { compacto } = useLayoutResponsivo();
  const reduzido = pequeno || compacto;
  return (
    <Image
      source={require("../../assets/prototipo/logo-fiel.png")}
      accessibilityLabel="Passaporte Local"
      style={{ width: reduzido ? 126 : 180, height: reduzido ? 47 : 66, flexShrink: 0 }}
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
  alinharInicio = false,
}: {
  titulo?: string;
  voltar?: boolean;
  alinharInicio?: boolean;
}) {
  return (
    <View style={[visual.header, alinharInicio && { justifyContent: "flex-start" }]}>
      {voltar && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/inicio")
          }
          style={{ padding: 8, ...(!titulo ? { position: "absolute", left: 0, zIndex: 1 } as const : {}) }}
        >
          <Icone nome="voltar" tamanho={28} />
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
export function MiniFoto({ visita, compacto = false }: { visita: Visita; compacto?: boolean }) {
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
      style={[visual.thumb, compacto && { width: 80, height: 68 }]}
      onError={() => setUrl(null)}
    />
  ) : (
    <View
      style={[
        visual.thumb,
        compacto && { width: 80, height: 68 },
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
  const { compacto: telaCompacta } = useLayoutResponsivo();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${visita.lugar}`}
      onPress={() =>
        router.push({ pathname: "/detalhes", params: { id: visita.id } })
      }
      style={[visual.ticket, compacto && { minHeight: 76, padding: 6 }]}
    >
      <Image source={require("../../assets/prototipo/papel.png")} style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: 0.25 }]} resizeMode="cover" />
      <MiniFoto visita={visita} compacto={compacto || telaCompacta} />
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: 15, fontWeight: "700", color: cores.tinta }}
        >
          {visita.lugar}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icone nome="lugar" tamanho={14} cor={cores.suave} /><Text style={[visual.meta, { flex: 1 }]}>{visita.cidade}, {visita.uf}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icone nome="calendario" tamanho={14} cor={cores.suave} /><Text style={[visual.meta, { flexShrink: 1 }]}>{formatarDataVisita(visita.data)}</Text></View>
        {!compacto && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icone nome={visita.categoria === 'Parque' ? 'natureza' : visita.categoria === 'Museu' ? 'museu' : visita.categoria === 'Cafeteria' ? 'cafe' : 'lugar'} tamanho={14} cor={cores.suave} /><Text style={visual.meta}>{visita.categoria}</Text></View>}
      </View>
      <Icone nome="proximo" tamanho={24} cor={cores.suave} />
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
        <Icone nome="expandir" tamanho={18} />
      </Pressable>
      <Modal
        transparent
        visible={aberto}
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable onPress={() => setAberto(false)} style={visual.overlay}>
          <Dialogo>
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
          </Dialogo>
        </Pressable>
      </Modal>
    </>
  );
}
export const visual = StyleSheet.create({
  screen: { flex: 1, backgroundColor: cores.papel },
  content: { width: "100%", maxWidth: 600, alignSelf: "center", padding: 16, paddingBottom: 24 },
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
    width: "100%", maxWidth: 600, alignSelf: "center",
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
    overflow: "hidden",
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
    maxHeight: "85%",
    padding: 22,
    backgroundColor: cores.papel,
    borderRadius: 18,
  },
});

export function Dialogo({ children }: { children: ReactNode }) {
  return <ScrollView style={[visual.dialog, { flexGrow: 0, padding: 0 }]} contentContainerStyle={{ padding: 22 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}
