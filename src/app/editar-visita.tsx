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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvaliacaoEstrelas from "../componentes/AvaliacaoEstrelas";
import FotoVisita from "../componentes/FotoVisita";
import SeletorFoto from "../componentes/SeletorFoto";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import { enviarFoto, excluirFoto } from "../servicos/fotosService";
import type { FotoSelecionada } from "../servicos/selecaoFotoService";

import { categorias, estados, dataValida } from "../lib/validacaoVisita";

export default function EditarVisita() {
  const { compacto } = useLayoutResponsivo();
  const { visitas, editarVisita } = useVisitas();
  const { sessao } = useAutenticacao();

  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const visitaId = Array.isArray(id) ? id[0] : id;
  const visita = visitas.find((item) => item.id === visitaId);

  const [lugar, setLugar] = useState(visita?.lugar ?? "");
  const [cidade, setCidade] = useState(visita?.cidade ?? "");
  const [uf, setUf] = useState(visita?.uf ?? "");
  const [categoria, setCategoria] = useState(visita?.categoria ?? "");
  const [data, setData] = useState(visita?.data ?? "");
  const [comentario, setComentario] = useState(visita?.comentario ?? "");
  const [avaliacao, setAvaliacao] = useState<number | null>(
    visita?.avaliacao ?? null,
  );

  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [removerFotoAtual, setRemoverFotoAtual] = useState(false);
  const [selecionandoFoto, setSelecionandoFoto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const envioEmAndamento = useRef(false);
  const selecaoEmAndamento = useRef(false);
  const fotoEnviada = useRef<{
    foto: FotoSelecionada;
    caminho: string;
  } | null>(null);

  const bloqueado = salvando || selecionandoFoto;
  const caminhoAtual = visita?.foto_path ?? null;

  function acompanharSelecao(selecionando: boolean) {
    selecaoEmAndamento.current = selecionando;
    setSelecionandoFoto(selecionando);
  }

  function alterarFoto(escolhida: FotoSelecionada | null) {
    setFoto(escolhida);
    setRemoverFotoAtual(escolhida === null);
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
    if (envioEmAndamento.current || selecaoEmAndamento.current) {
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

    const caminhoAnterior = caminhoAtual;

    try {
      let novoCaminho = removerFotoAtual ? null : caminhoAnterior;

      if (foto) {
        if (fotoEnviada.current?.foto === foto) {
          novoCaminho = fotoEnviada.current.caminho;
        } else {
          setEnviandoFoto(true);

          try {
            novoCaminho = await enviarFoto(usuarioId, foto.conteudo, foto.tipo);

            fotoEnviada.current = {
              foto,
              caminho: novoCaminho,
            };
          } finally {
            setEnviandoFoto(false);
          }
        }
      }

      await editarVisita(visita.id, {
        lugar: lugar.trim(),
        cidade: cidade.trim(),
        uf,
        categoria,
        data,
        comentario: comentario.trim(),
        avaliacao,
        foto_path: novoCaminho,
      });

      if (caminhoAnterior && caminhoAnterior !== novoCaminho) {
        try {
          await excluirFoto(usuarioId, caminhoAnterior);
        } catch {
          Alert.alert(
            "Visita atualizada",
            "A alteração foi salva, mas não foi possível apagar o arquivo da foto antiga do armazenamento.",
          );
        }
      }

      voltar();
    } catch {
      informarErro(
        "Não foi possível atualizar",
        "Os campos e a foto selecionada foram mantidos. Confira sua conexão e tente novamente.",
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

          {!visita ? (
            <>
              <Text style={styles.title}>Visita não encontrada</Text>
              <Text style={styles.description}>
                Volte à lista e selecione uma visita.
              </Text>
            </>
          ) : (
            <>

              <Text style={styles.description}>
                Ajuste os dados e atualize sua lembrança.
              </Text>

              <Text style={styles.fieldLabel}>Foto da visita (opcional)</Text>

              {caminhoAtual && !foto && !removerFotoAtual ? (
                <View style={styles.currentPhoto}>
                  <FotoVisita key={caminhoAtual} caminho={caminhoAtual} compacto />

                  <Pressable
                    disabled={bloqueado}
                    onPress={() => setRemoverFotoAtual(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.removeButton,
                      (pressed || bloqueado) && styles.pressed,
                    ]}
                  >
                    <Text style={styles.removeText}>Remover foto atual</Text>
                  </Pressable>
                </View>
              ) : null}

              {removerFotoAtual && caminhoAtual && !foto && (
                <View style={styles.notice}>
                  <Text style={styles.hint}>
                    A foto atual será removida ao salvar.
                  </Text>
                  <Pressable
                    disabled={bloqueado}
                    onPress={() => setRemoverFotoAtual(false)}
                    accessibilityRole="button"
                    style={styles.undoButton}
                  >
                    <Text style={styles.backText}>Manter foto atual</Text>
                  </Pressable>
                </View>
              )}

              <SeletorFoto
                fotoAtual={!!caminhoAtual && !removerFotoAtual}
                foto={foto}
                onChange={alterarFoto}
                desabilitado={salvando}
                onSelecionandoChange={acompanharSelecao}
              />

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
                placeholderTextColor="#7C827A"
                value={data}
                onChangeText={(texto) => setData(formatarEntradaData(texto))}
                maxLength={10}
                autoCorrect={false}
                keyboardType="number-pad"
                editable={!bloqueado}
              />

              <Text style={styles.fieldLabel}>Sua avaliação (opcional)</Text>
              <AvaliacaoEstrelas
                valor={avaliacao}
                onChange={setAvaliacao}
                desabilitado={bloqueado}
              />

              <Text style={styles.fieldLabel}>Comentário (opcional)</Text>
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
                    ? "Enviando foto..."
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
                <Text style={{ color: "#BC592F", fontWeight: "600" }}>
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
    backgroundColor: "#F8F5EC",
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
  backText: {
    color: "#183F35",
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    color: "#C76B48",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: "#183F35",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 8,
  },
  description: {
    color: "#53645B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  fieldLabel: {
    color: "#183F35",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F6F3EB",
    color: "#183F35",
    borderWidth: 1,
    borderColor: "#DED9CE",
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
    backgroundColor: "#F6F3EB",
    borderWidth: 1,
    borderColor: "#DED9CE",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categorySelected: {
    backgroundColor: "#183F35",
    borderColor: "#183F35",
  },
  categoryText: {
    color: "#53645B",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  currentPhoto: {
    marginBottom: 16,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#A33B32",
    borderRadius: 9,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  removeText: {
    color: "#A33B32",
    fontSize: 13,
    fontWeight: "700",
  },
  notice: {
    marginBottom: 16,
  },
  undoButton: {
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  commentInput: {
    minHeight: 80,
  },
  counter: {
    color: "#53645B",
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  hint: {
    color: "#53645B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#183F35",
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
