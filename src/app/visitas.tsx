import Text from "../componentes/Texto";
import BotaoAtualizar from "../componentes/BotaoAtualizar";
import { chaveCidade, normalizarTexto, rotuloCidade, localizacaoVisita } from "../lib/cidades";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import Icone from '../componentes/Icone';
import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVisitas } from "../contextos/VisitasContext";
import { compararDatasVisitas } from "../lib/formatacaoData";
import {
  BilheteVisita,
  Filtro,
  NavegacaoInferior,
  cores,
  visual,
} from "../componentes/Design";
const normalizar = normalizarTexto;
export default function Visitas() {
  const { compacto } = useLayoutResponsivo();
  const { visitas, carregando, erro, recarregarVisitas } = useVisitas();
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ordem, setOrdem] = useState("desc");
  const todas = [...visitas];
  const categorias = Array.from(new Set(todas.map((visita) => visita.categoria)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const cidades = Array.from(
    new Map(
      todas.map((v) => [
        chaveCidade(v.cidade, v.uf),
        rotuloCidade(v.cidade, v.uf),
      ]),
    ).entries(),
  ).map(([id, nome]) => ({ id, nome }));
  const cidadeAtiva = cidades.some((c) => c.id === cidade) ? cidade : "";
  const filtradas = todas.filter(
    (v) =>
      normalizar(`${v.lugar} ${v.cidade} ${localizacaoVisita(v.cidade, v.uf).cidade} ${v.uf} ${v.categoria}`)
        .includes(normalizar(busca.trim())) &&
      (!categoria || v.categoria === categoria) &&
      (!cidadeAtiva || chaveCidade(v.cidade, v.uf) === cidadeAtiva),
  ).sort((a, b) => {
    const comparacao = compararDatasVisitas(a.data, b.data);
    return ordem === "asc" ? comparacao : -comparacao;
  });
  return (
    <SafeAreaView style={visual.screen}>
      <FlatList
        data={filtradas}
        refreshing={carregando}
        onRefresh={() => { if (!carregando) recarregarVisitas(); }}
        alwaysBounceVertical
        keyExtractor={(v) => v.id}
        contentContainerStyle={visual.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <>
            <Text style={estilos.chamada}>Lugares que fazem parte de você</Text>
            <View style={{ flexDirection: compacto ? "column" : "row", alignItems: compacto ? "flex-start" : "center", gap: 8 }}>
              <Text accessibilityRole="header" style={visual.title}>Minhas visitas</Text>
              <BotaoAtualizar carregando={carregando} onPress={recarregarVisitas} />
            </View>
            {!!erro && <Text accessibilityLiveRegion="polite" style={visual.subtitle}>Não foi possível atualizar suas visitas. Toque em Atualizar para tentar novamente.</Text>}
            <View style={estilos.busca}>
              <Icone nome="busca" tamanho={20} cor={cores.suave} />
              <TextInput
                accessibilityLabel="Buscar por lugar ou cidade"
                placeholder="Buscar por lugar ou cidade"
                placeholderTextColor={cores.suave}
                value={busca}
                onChangeText={setBusca}
                style={estilos.campoBusca}
              />
            </View>
            <View
              style={{
                flexDirection: compacto ? "column" : "row",
                gap: 8,
                marginTop: 8,
                marginBottom: 7,
              }}
            >
              <Filtro
                valor={cidadeAtiva}
                onChange={setCidade}
                opcoes={[{ id: "", nome: "Todas as cidades" }, ...cidades]}
              />
              <Filtro
                valor={categoria}
                onChange={setCategoria}
                opcoes={["", ...categorias].map(
                  (id) => ({ id, nome: id || "Todas as categorias" }),
                )}
              />
            </View>
            <View style={estilos.ordenacao}>
              <Text style={visual.subtitle}>Data da visita</Text>
              <Filtro
                valor={ordem}
                onChange={setOrdem}
                opcoes={[
                  { id: "desc", nome: "Mais recentes" },
                  { id: "asc", nome: "Mais antigas" },
                ]}
              />
            </View>
            {!!(busca || categoria || cidadeAtiva) && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setBusca("");
                  setCidade("");
                  setCategoria("");
                }}
              >
                <Text style={[visual.link, { paddingVertical: 8 }]}>
                  Limpar busca e filtros
                </Text>
              </Pressable>
            )}
            {!carregando && (
              <Text accessibilityLiveRegion="polite" style={[visual.subtitle, { marginBottom: 12 }]}>
                {filtradas.length} {filtradas.length === 1 ? "lembrança encontrada" : "lembranças encontradas"}
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => <BilheteVisita visita={item} />}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={cores.verde} />
          ) : erro ? (
            <Pressable onPress={recarregarVisitas}>
              <Text style={visual.subtitle}>
                {erro} Toque para tentar novamente.
              </Text>
            </Pressable>
          ) : (
            <Text style={[visual.subtitle, { paddingVertical: 24 }]}>
              Nenhuma visita encontrada. Experimente limpar os filtros.
            </Text>
          )
        }
      />
      <View style={estilos.rodape}>
        <Pressable
            accessibilityRole="button"
            disabled={carregando || !!erro}
            onPress={() => router.push("/nova-visita")}
            style={[visual.button, estilos.botaoRodape, (carregando || !!erro) && { opacity: 0.5 }]}
          >
            <Text style={visual.buttonText}>＋ Registrar visita</Text>
          </Pressable>
      </View>
      <NavegacaoInferior ativa="visitas" />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  chamada: {
    color: cores.laranja,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  ordenacao: {
    gap: 4,
    marginBottom: 10,
  },
  rodape: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  botaoRodape: {
    marginTop: 0,
  },
  busca: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
    paddingLeft: 14,
    backgroundColor: "#FFF",
  },
  campoBusca: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 12,
    color: cores.tinta,
  },
});
