import { paleta } from "../lib/paleta";
import Text from "./Texto";
import { rotuloCidade, localizacaoVisita } from "../lib/cidades";
import useFotoPrivada from "./useFotoPrivada";
import type { ReactNode } from "react";
import useLayoutResponsivo from "./useLayoutResponsivo";
import { formatarDataVisita } from "../lib/formatacaoData";
import Icone from "./Icone";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,

  View,
} from "react-native";
import { router } from "expo-router";
import type { Visita } from "../dados/visitas";

export const cores = {
  verde: paleta.petroleo,
  papel: paleta.papel,
  tinta: paleta.tinta,
  laranja: "#B74D39",
  coral: paleta.coral,
  borda: paleta.borda,
  suave: paleta.suave,
};
export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  const { compacto } = useLayoutResponsivo();
  const reduzido = pequeno || compacto;
  return (
    <Image
      source={require("../../assets/identidade/logo.png")}
      accessibilityLabel="Passaporte Local"
      style={{ width: reduzido ? 112 : 160, height: reduzido ? 34 : 48, flexShrink: 0 }}
      resizeMode="contain"
    />
  );
}
export function Decoracao({ paisagem = false }: { paisagem?: boolean }) {
  return null;
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
    <View style={[visual.header, { justifyContent: "flex-start" }]}>
      {voltar && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/inicio")
          }
          style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
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
      {!titulo && <Logo />}
    </View>
  );
}
export function NavegacaoInferior({
  ativa,
}: {
  ativa: "inicio" | "visitas" | "explorar" | "perfil";
}) {
  return (
    <View style={visual.nav}>
      {(["inicio", "visitas", "explorar", "perfil"] as const).map((item, i) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: ativa === item }}
          onPress={() => router.replace(item === "explorar" ? "./explorar" : `/${item}`)}
          style={visual.navItem}
        >
          <Icone
            nome={
              item === "inicio"
                ? "inicio"
                : item === "visitas"
                  ? "lugar"
                  : item === "explorar" ? "mundo" : "perfil"
            }
            tamanho={24}
            cor={ativa === item ? cores.verde : cores.suave}
          />
          <Text
            style={{
              fontSize: 11,
              color: ativa === item ? cores.verde : cores.suave,
            }}
          >
            {["Início", "Visitas", "Explorar", "Perfil"][i]}
          </Text>
          <View
            style={{
              height: 2,
              width: 28,
              backgroundColor: ativa === item ? cores.coral : "transparent",
              marginTop: 4,
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}
export function MiniFoto({ visita, compacto = false }: { visita: Visita; compacto?: boolean }) {
  const { url, erro, carregando, tentarNovamente, falhar } = useFotoPrivada(visita.foto_path ?? null);
  if (visita.foto_path && (erro || carregando)) return <Pressable disabled={carregando} accessibilityRole="button" accessibilityLabel={carregando ? 'Carregando foto' : 'Tentar carregar foto novamente'} onPress={(evento) => { evento.stopPropagation(); tentarNovamente(); }} style={[visual.thumb, compacto && { width: 80, height: 68 }, { justifyContent: 'center', alignItems: 'center', padding: 4 }]}><Text style={{ color: cores.verde, fontSize: 11, textAlign: 'center' }}>{carregando ? 'Carregando…' : 'Foto indisponível. Tentar novamente'}</Text></Pressable>;
  return url ? (
    <Image
      source={{ uri: url }}
      style={[visual.thumb, compacto && { width: 80, height: 68 }]}
      onError={falhar}
    />
  ) : (
    <View
      style={[
        visual.thumb,
        compacto && { width: 80, height: 68 },
        {
          backgroundColor: paleta.claro,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Icone nome="lugar" tamanho={36} cor={paleta.petroleo} />
      <Text style={{ color: cores.verde, fontSize: 10 }}>VISITADO</Text>
    </View>
  );
}
export function BilheteVisita({
  visita,
  compacto = false,
  miniatura,
  aoAbrir,
}: {
  visita: Visita;
  compacto?: boolean;
  miniatura?: import("react").ReactNode;
  aoAbrir?: () => void;
}) {
  const { compacto: telaCompacta } = useLayoutResponsivo();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${visita.lugar}`}
      onPress={aoAbrir ?? (() =>
        router.push({ pathname: "/detalhes", params: { id: visita.id } })
      )}
      style={[visual.ticket, compacto && { minHeight: 76, padding: 6 }]}
    >

      {miniatura ?? <MiniFoto visita={visita} compacto={compacto || telaCompacta} />}
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: 15, fontWeight: "700", color: cores.tinta }}
        >
          {visita.lugar}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icone nome="lugar" tamanho={14} cor={cores.suave} /><Text style={[visual.meta, { flex: 1 }]}>{rotuloCidade(visita.cidade, visita.uf)}</Text></View>
        {!!localizacaoVisita(visita.cidade, visita.uf).localidade && !compacto && <Text style={[visual.meta, { fontSize: 11 }]}>{localizacaoVisita(visita.cidade, visita.uf).localidade}</Text>}
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
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={opcoes.find((o) => o.id === valor)?.nome ?? "Selecionar opção"}
        style={visual.select}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, color: cores.tinta, fontSize: 14 }}
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
  content: { width: "100%", maxWidth: 600, alignSelf: "center", padding: 22, paddingBottom: 32 },
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
    borderRadius: 16,
    minHeight: 52,
    justifyContent: "center",
    padding: 14,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  link: { color: cores.verde, fontSize: 14, textDecorationLine: "underline" },
  nav: {
    width: "100%", maxWidth: 600, alignSelf: "center",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.papel,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navItem: { minHeight: 52, justifyContent: "center", flex: 1, alignItems: "center", gap: 3 },
  ticket: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    minHeight: 104,
    overflow: "hidden",
  },
  thumb: { width: 91, height: 85, borderRadius: 12 },
  meta: { fontSize: 12, color: cores.suave },
  select: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
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
