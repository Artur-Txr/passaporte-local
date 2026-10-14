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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVisitas } from "../contextos/VisitasContext";
import {
  BilheteVisita,
  Cabecalho,
  Decoracao,
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
  const cidades = Array.from(
    new Map(
      visitas.map((v) => [
        chaveCidade(v.cidade, v.uf),
        rotuloCidade(v.cidade, v.uf),
      ]),
    ).entries(),
  ).map(([id, nome]) => ({ id, nome }));
  const cidadeAtiva = cidades.some((c) => c.id === cidade) ? cidade : "";
  const filtradas = visitas.filter(
    (v) =>
      (normalizar(v.lugar).includes(normalizar(busca)) ||
        normalizar(v.cidade).includes(normalizar(busca)) ||
        normalizar(localizacaoVisita(v.cidade, v.uf).cidade).includes(normalizar(busca))) &&
      (!categoria || v.categoria === categoria) &&
      (!cidadeAtiva || chaveCidade(v.cidade, v.uf) === cidadeAtiva),
  );
  return (
    <SafeAreaView style={visual.screen}>
      <Decoracao />
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
            <Cabecalho />
            <View style={{ flexDirection: compacto ? "column" : "row", alignItems: compacto ? "flex-start" : "center", gap: 8 }}>
              <Text style={[visual.title, { flex: 1 }]}>Minhas visitas</Text>
              <BotaoAtualizar carregando={carregando} onPress={recarregarVisitas} />
            </View>
            {!!erro && visitas.length > 0 && <Text accessibilityLiveRegion="polite" style={visual.subtitle}>Não foi possível atualizar. Mostrando as visitas anteriores; toque em Atualizar para tentar novamente.</Text>}
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: cores.borda, borderRadius: 9, paddingLeft: 10, backgroundColor: '#F4F1E8' }}>
            <Icone nome="busca" tamanho={20} cor={cores.suave} />
            <TextInput
              accessibilityLabel="Buscar lugar"
              placeholder="Buscar lugar"
              value={busca}
              onChangeText={setBusca}
              style={{
                flex: 1,
                minWidth: 0,
                padding: 12,
                color: cores.tinta,
                backgroundColor: "#F4F1E8",
              }}
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
                opcoes={["", "Parque", "Museu", "Cafeteria", "Outro"].map(
                  (id) => ({ id, nome: id || "Todas as categorias" }),
                )}
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
              {visitas.length
                ? "Nenhuma visita encontrada. Experimente limpar os filtros."
                : "Registre sua primeira descoberta."}
            </Text>
          )
        }
        ListFooterComponent={
          <>
          <Pressable
            accessibilityRole="button"
            disabled={carregando || !!erro}
            onPress={() => router.push("/nova-visita")}
            style={visual.button}
          >
            <Text style={visual.buttonText}>＋ Nova visita</Text>
          </Pressable>
          </>
        }
      />
      <NavegacaoInferior ativa="visitas" />
    </SafeAreaView>
  );
}
