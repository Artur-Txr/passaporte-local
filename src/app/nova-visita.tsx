import SeletorLocalizacao from "../componentes/SeletorLocalizacao";
import useRascunho from "../componentes/useRascunho";
import { coordenadasValidas, type Coordenadas } from "../lib/mapa";
import { useFeedback } from "../contextos/FeedbackContext";
import { paleta } from "../lib/paleta";
import Text from "../componentes/Texto";
import useProtegerFormulario from "../componentes/useProtegerFormulario";
import { formatarEntradaData } from "../lib/formatacaoData";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import CampoTexto from "../componentes/CampoTexto";
import { Cabecalho, Decoracao, Filtro } from "../componentes/Design";
import { router } from "expo-router";
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

export default function NovaVisita() {
  const avisar = useFeedback();
  const [localizacao, setLocalizacao] = useState<Coordenadas | null>(null);
  const { compacto } = useLayoutResponsivo();
  const { adicionarVisita } = useVisitas();
  const { sessao } = useAutenticacao();

  const [lugar, setLugar] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState("");
  const [comentario, setComentario] = useState("");
  const [fotos, setFotos] = useState<FotoAlbum[]>([]);
  const [selecionandoFoto, setSelecionandoFoto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const envioEmAndamento = useRef(false);
  const selecaoEmAndamento = useRef(false);

  const fotosEnviadas = useRef(new Map<FotoSelecionada, string>());

  const rascunho = useRascunho(
    `passaporte:rascunho:${sessao?.user.id}:nova`,
    { lugar, cidade, uf, categoria, data, comentario, latitude: localizacao?.latitude ?? null, longitude: localizacao?.longitude ?? null },
    dados => {
      setLugar(dados.lugar); setCidade(dados.cidade); setUf(dados.uf);
      setCategoria(dados.categoria); setData(dados.data); setComentario(dados.comentario);
      setLocalizacao(coordenadasValidas(dados) ? { latitude: dados.latitude, longitude: dados.longitude } : null);
    },
  );
  const bloqueado = salvando || selecionandoFoto || !rascunho.pronto;
  const alterado = !!(lugar || cidade || uf || categoria || data || comentario || fotos.length || localizacao);
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

  async function salvarVisita() {
    setErro("");
    if (bloqueado || envioEmAndamento.current || selecaoEmAndamento.current) {
      return;
    }

    const usuarioId = sessao?.user.id;

    if (!usuarioId) {
      informarErro(
        "Entre na sua conta",
        "Faça login para registrar uma visita.",
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

      await adicionarVisita({
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
      avisar("Visita guardada!", { cidade: cidade.trim(), uf, data });
      concluirESair(voltar);
    } catch {
      informarErro(
        "Não foi possível salvar",
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
          <Cabecalho voltar titulo="Nova visita" />
          {rascunho.restaurado && <Text style={styles.hint}>Texto do rascunho recuperado.</Text>}
          {rascunho.falha && <Text style={styles.hint}>Não foi possível guardar o rascunho neste aparelho.</Text>}

          <Text style={styles.description}>Mais uma descoberta</Text>
          <Text accessibilityRole="header" style={styles.title}>Onde você esteve?</Text>

          <Text style={styles.fieldLabel}>Dados da visita</Text>

          <Text style={styles.fieldLabel}>Lugar *</Text>

          <CampoTexto icone="lugar"
            style={styles.input}
            placeholder="Ex.: Pelourinho"
            placeholderTextColor={paleta.suave}
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
                placeholder="Ex.: Salvador"
                placeholderTextColor={paleta.suave}
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

          <Text style={styles.hint}>
            Digite dia, mês e ano. As barras são preenchidas automaticamente.
          </Text>

          <SeletorLocalizacao buscaInicial={[lugar, cidade, uf].filter(Boolean).join(", ")} valor={localizacao} onChange={setLocalizacao} bloqueado={bloqueado} />
          <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Minha lembrança</Text>

          <EditorAlbum fotos={fotos} onChange={setFotos} bloqueado={bloqueado} onSelecionandoChange={acompanharSelecao} />

          <Text style={styles.fieldLabel}>Sua lembrança (opcional)</Text>

          <CampoTexto icone="editar"
            style={[styles.input, styles.commentInput]}
            placeholder="O que marcou esse passeio?"
            placeholderTextColor={paleta.suave}
            value={comentario}
            onChangeText={setComentario}
            multiline
            maxLength={500}
            textAlignVertical="top"
            editable={!bloqueado}
          />

          <Text style={styles.counter}>{comentario.length}/500 caracteres</Text>

          <Text style={styles.hint}>* Campos obrigatórios</Text>

          {erro ? (
            <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
              {erro}
            </Text>
          ) : null}

          <Pressable
            onPress={salvarVisita}
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
                  : "Guardar visita"}
            </Text>
          </Pressable>
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
  backText: {
    color: paleta.petroleo,
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 5,
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
    opacity: 0.75,
  },
});
