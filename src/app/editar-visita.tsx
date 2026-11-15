import SeletorLocalizacao from "../componentes/SeletorLocalizacao";
import useRascunho from "../componentes/useRascunho";
import { coordenadasValidas, type Coordenadas } from "../lib/mapa";
import { useFeedback } from "../contextos/FeedbackContext";
import { fotosDaVisita } from "../dados/visitas";
import { paleta } from "../lib/paleta";
import Text from "../componentes/Texto";
import type { Visita } from "../dados/visitas";
import EstadoConsulta from "../componentes/EstadoConsulta";
import useProtegerFormulario from "../componentes/useProtegerFormulario";
import { formatarEntradaData } from "../lib/formatacaoData";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import CampoTexto from "../componentes/CampoTexto";
import { Cabecalho, Decoracao, Filtro } from "../componentes/Design";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,

  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EditorAlbum, { enviarAlbum, type FotoAlbum } from "../componentes/EditorAlbum";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import type { FotoSelecionada } from "../servicos/selecaoFotoService";

import { categorias, estados, dataValida } from "../lib/validacaoVisita";

export default function EditarVisita() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { visitas, carregando, erro, recarregarVisitas } = useVisitas();
  const visitaId = Array.isArray(id) ? id[0] : id;
  const visita = visitas.find((item) => item.id === visitaId);
  if (!visita) return <SafeAreaView style={styles.screen}><Cabecalho voltar titulo="Editar visita" /><EstadoConsulta carregando={carregando} erro={erro} tentarNovamente={recarregarVisitas} /></SafeAreaView>;
  return <FormularioEdicao key={visita.id} visita={visita} />;
}

function FormularioEdicao({ visita }: { visita: Visita }) {
  const avisar = useFeedback();
  const [localizacao, setLocalizacao] = useState<Coordenadas | null>(coordenadasValidas(visita) ? { latitude: visita.latitude, longitude: visita.longitude } : null);
  const { compacto } = useLayoutResponsivo();
  const { editarVisita } = useVisitas();
  const { sessao } = useAutenticacao();
  const original = useRef(visita).current;
  const [lugar, setLugar] = useState(visita?.lugar ?? "");
  const [cidade, setCidade] = useState(visita?.cidade ?? "");
  const [uf, setUf] = useState(visita?.uf ?? "");
  const [categoria, setCategoria] = useState(visita?.categoria ?? "");
  const [data, setData] = useState(visita?.data ?? "");
  const [comentario, setComentario] = useState(visita?.comentario ?? "");

  const [fotos, setFotos] = useState<FotoAlbum[]>(() => fotosDaVisita(visita));
  const [selecionandoFoto, setSelecionandoFoto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const envioEmAndamento = useRef(false);
  const selecaoEmAndamento = useRef(false);
  const fotosEnviadas = useRef(new Map<FotoSelecionada, string>());

  const rascunho = useRascunho(
    `passaporte:rascunho:${sessao?.user.id}:editar:${visita.id}`,
    { lugar, cidade, uf, categoria, data, comentario, latitude: localizacao?.latitude ?? null, longitude: localizacao?.longitude ?? null },
    dados => {
      setLugar(dados.lugar); setCidade(dados.cidade); setUf(dados.uf);
      setCategoria(dados.categoria); setData(dados.data); setComentario(dados.comentario);
      setLocalizacao(coordenadasValidas(dados) ? { latitude: dados.latitude, longitude: dados.longitude } : null);
    },
  );
  const bloqueado = salvando || selecionandoFoto || !rascunho.pronto;
  const fotosOriginais = fotosDaVisita(original);
  const fotosAlteradas = fotos.length !== fotosOriginais.length || fotos.some((foto, indice) => foto !== fotosOriginais[indice]);
  const alterado = lugar !== original.lugar || cidade !== original.cidade || uf !== original.uf || categoria !== original.categoria || data !== original.data || comentario !== original.comentario || fotosAlteradas || localizacao?.latitude !== (original.latitude ?? undefined) || localizacao?.longitude !== (original.longitude ?? undefined);
  const concluirESair = useProtegerFormulario(alterado, bloqueado);


  function acompanharSelecao(selecionando: boolean) {
    selecaoEmAndamento.current = selecionando;
    setSelecionandoFoto(selecionando);
  }


  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/inicio");
    }
  }

  function informarErro(titulo: string, mensagem: string) {
    setErro(`${titulo}. ${mensagem}`);
    if (Platform.OS !== "web") Alert.alert(titulo, mensagem);
  }

  async function salvarAlteracoes() {
    setErro("");
    if (bloqueado || envioEmAndamento.current || selecaoEmAndamento.current) {
      return;
    }

    const usuarioId = sessao?.user.id;

    if (!visita || !usuarioId) {
      informarErro(
        "Não foi possível continuar",
        "Entre na sua conta e selecione uma visita.",
      );
      return;
    }

    if (!lugar.trim() || !cidade.trim()) {
      informarErro("Preencha os campos", "Informe o nome do lugar e a cidade.");
      return;
    }

    if (!estados.includes(uf)) {
      informarErro("Confira a UF", "Informe uma sigla válida, como BA ou SP.");
      return;
    }

    if (!categorias.includes(categoria)) {
      informarErro(
        "Escolha uma categoria",
        "Selecione o tipo de lugar visitado.",
      );
      return;
    }

    if (!dataValida(data)) {
      informarErro(
        "Confira a data",
        "Use DD/MM/AAAA, com uma data válida entre 1900 e hoje.",
      );
      return;
    }

    envioEmAndamento.current = true;
    setSalvando(true);

    try {
      setEnviandoFoto(fotos.some((foto) => typeof foto !== "string"));
      const [capa, ...fotosAdicionais] = await enviarAlbum(usuarioId, fotos, fotosEnviadas.current);
      setEnviandoFoto(false);

      await editarVisita(visita.id, {
        lugar: lugar.trim(),
        cidade: cidade.trim(),
        uf,
        categoria,
        data,
        comentario: comentario.trim(),
        foto_path: capa ?? null,
        fotos_adicionais: fotosAdicionais,
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
      });

      await rascunho.limpar();
      avisar("Visita atualizada.");
      concluirESair(voltar);
    } catch {
      informarErro(
        "Não foi possível atualizar",
        "Os campos e as fotos selecionadas foram mantidos. Confira sua conexão e tente novamente.",
      );
    } finally {
      envioEmAndamento.current = false;
      setEnviandoFoto(false);
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Decoracao paisagem={false} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Cabecalho voltar titulo="Editar visita" />
          {rascunho.restaurado && <Text style={styles.hint}>Texto do rascunho recuperado.</Text>}
          {rascunho.falha && <Text style={styles.hint}>Não foi possível guardar o rascunho neste aparelho.</Text>}

          {!visita ? (
            <>
              <Text style={styles.title}>Visita não encontrada</Text>
              <Text style={styles.description}>
                Volte à lista e selecione uma visita.
              </Text>
            </>
          ) : (
            <>

              <Text style={styles.description}>Atualize sua história</Text>
              <Text accessibilityRole="header" style={styles.title}>Sua visita, do seu jeito.</Text>

              <Text style={styles.fieldLabel}>Dados da visita</Text>

              <Text style={styles.fieldLabel}>Lugar *</Text>
              <CampoTexto icone="lugar"
                style={styles.input}
                value={lugar}
                onChangeText={setLugar}
                maxLength={120}
                autoCapitalize="words"
                editable={!bloqueado}
              />

              <View style={{ flexDirection: compacto ? "column" : "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Cidade *</Text>
                  <CampoTexto icone="cidade"
                    style={styles.input}
                    value={cidade}
                    onChangeText={setCidade}
                    maxLength={100}
                    autoCapitalize="words"
                    editable={!bloqueado}
                  />
                </View>
                <View style={{ width: compacto ? "100%" : 85 }}>
                  <Text style={styles.fieldLabel}>UF *</Text>
                  <Filtro
                    valor={uf}
                    onChange={setUf}
                    opcoes={[
                      { id: "", nome: "UF" },
                      ...estados.map((id) => ({ id, nome: id })),
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Categoria *</Text>
              <Filtro
                valor={categoria}
                onChange={setCategoria}
                opcoes={[
                  { id: "", nome: "Selecione uma categoria" },
                  ...categorias.map((id) => ({ id, nome: id })),
                ]}
              />

              <Text style={styles.fieldLabel}>Data da visita *</Text>
              <CampoTexto icone="calendario"
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={paleta.suave}
                value={data}
                onChangeText={(texto) => setData(formatarEntradaData(texto))}
                maxLength={10}
                autoCorrect={false}
                keyboardType="number-pad"
                editable={!bloqueado}
              />

          <SeletorLocalizacao buscaInicial={[lugar, cidade, uf].filter(Boolean).join(", ")} valor={localizacao} onChange={setLocalizacao} bloqueado={bloqueado} />
              <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Minha lembrança</Text>

              <EditorAlbum fotos={fotos} onChange={setFotos} bloqueado={bloqueado} onSelecionandoChange={acompanharSelecao} />

              <Text style={styles.fieldLabel}>Sua lembrança (opcional)</Text>
              <CampoTexto icone="editar"
                style={[styles.input, styles.commentInput]}
                value={comentario}
                onChangeText={setComentario}
                multiline
                maxLength={500}
                textAlignVertical="top"
                editable={!bloqueado}
              />

              <Text style={styles.counter}>
                {comentario.length}/500 caracteres
              </Text>
              <Text style={styles.hint}>* Campos obrigatórios</Text>

              {erro ? (
                <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                  {erro}
                </Text>
              ) : null}

              <Pressable
                onPress={salvarAlteracoes}
                disabled={bloqueado}
                accessibilityRole="button"
                accessibilityState={{ disabled: bloqueado }}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || bloqueado) && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {enviandoFoto
                    ? "Enviando fotos..."
                    : salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                </Text>
              </Pressable>
              <Pressable
                disabled={bloqueado}
                onPress={voltar}
                style={{ alignItems: "center", padding: 14 }}
              >
                <Text style={{ color: "#B74D39", fontWeight: "600" }}>
                  Cancelar
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  error: { color: "#942F24", backgroundColor: "#FBEAE3", padding: 12, borderRadius: 9, marginTop: 12, fontSize: 14, lineHeight: 20 },
  screen: {
    flex: 1,
    backgroundColor: paleta.papel,
  },
  keyboard: {
    flex: 1,
  },
  content: { width: "100%", maxWidth: 600, alignSelf: "center",
    padding: 20,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingRight: 16,
    marginBottom: 4,
  },
  label: {
    color: paleta.petroleo,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: paleta.petroleo,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 8,
  },
  description: {
    color: paleta.suave,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  fieldLabel: {
    color: paleta.petroleo,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: paleta.petroleo,
    borderWidth: 1,
    borderColor: paleta.borda,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: paleta.borda,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categorySelected: {
    backgroundColor: paleta.petroleo,
    borderColor: paleta.petroleo,
  },
  categoryText: {
    color: paleta.suave,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  commentInput: {
    minHeight: 80,
  },
  counter: {
    color: paleta.suave,
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  hint: {
    color: paleta.suave,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  button: {
    backgroundColor: paleta.petroleo,
    borderRadius: 9,
    padding: 13,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
});
