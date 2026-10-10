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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvaliacaoEstrelas from "../componentes/AvaliacaoEstrelas";
import SeletorFoto from "../componentes/SeletorFoto";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { useVisitas } from "../contextos/VisitasContext";
import { enviarFoto } from "../servicos/fotosService";
import type { FotoSelecionada } from "../servicos/selecaoFotoService";

import { categorias, estados, dataValida } from "../lib/validacaoVisita";

export default function NovaVisita() {
  const { adicionarVisita } = useVisitas();
  const { sessao } = useAutenticacao();

  const [lugar, setLugar] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState("");
  const [comentario, setComentario] = useState("");
  const [avaliacao, setAvaliacao] = useState<number | null>(null);
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
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
    if (envioEmAndamento.current || selecaoEmAndamento.current) {
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
      let caminhoFoto: string | null = null;

      if (foto) {
        if (fotoEnviada.current?.foto === foto) {
          caminhoFoto = fotoEnviada.current.caminho;
        } else {
          setEnviandoFoto(true);

          try {
            caminhoFoto = await enviarFoto(usuarioId, foto.conteudo, foto.tipo);

            fotoEnviada.current = {
              foto,
              caminho: caminhoFoto,
            };
          } finally {
            setEnviandoFoto(false);
          }
        }
      }

      await adicionarVisita({
        lugar: lugar.trim(),
        cidade: cidade.trim(),
        uf,
        categoria,
        data,
        comentario: comentario.trim(),
        avaliacao,
        foto_path: caminhoFoto,
      });

      voltar();
    } catch {
      informarErro(
        "Não foi possível salvar",
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Cabecalho voltar />

          <Text style={styles.title}>Nova visita</Text>

          <Text style={styles.description}>Guarde mais uma descoberta.</Text>

          <SeletorFoto
            foto={foto}
            onChange={setFoto}
            desabilitado={salvando}
            onSelecionandoChange={acompanharSelecao}
          />

          <Text style={styles.fieldLabel}>Lugar *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Pelourinho"
            placeholderTextColor="#7C827A"
            value={lugar}
            onChangeText={setLugar}
            maxLength={120}
            autoCapitalize="words"
            editable={!bloqueado}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Cidade *</Text>

              <TextInput
                style={styles.input}
                placeholder="Ex.: Salvador"
                placeholderTextColor="#7C827A"
                value={cidade}
                onChangeText={setCidade}
                maxLength={100}
                autoCapitalize="words"
                editable={!bloqueado}
              />
            </View>
            <View style={{ width: 85 }}>
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

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#7C827A"
            value={data}
            onChangeText={setData}
            maxLength={10}
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            editable={!bloqueado}
          />

          <Text style={styles.hint}>
            Digite também as barras. Ex.: 04/10/2026.
          </Text>

          <Text style={styles.fieldLabel}>Sua avaliação (opcional)</Text>

          <AvaliacaoEstrelas
            valor={avaliacao}
            onChange={setAvaliacao}
            desabilitado={bloqueado}
          />

          <Text style={styles.fieldLabel}>Comentário (opcional)</Text>

          <TextInput
            style={[styles.input, styles.commentInput]}
            placeholder="O que marcou esse passeio?"
            placeholderTextColor="#7C827A"
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
                ? "Enviando foto..."
                : salvando
                  ? "Salvando..."
                  : "Salvar visita"}
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
    backgroundColor: "#F8F5EC",
  },
  keyboard: {
    flex: 1,
  },
  content: {
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
    marginBottom: 5,
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
    opacity: 0.75,
  },
});
