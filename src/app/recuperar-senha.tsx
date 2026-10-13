import { Cabecalho, Decoracao } from "../componentes/Design";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { extrairTokenRecuperacao, validarNovaSenha } from "../lib/recuperacao";
import { useAutenticacao } from "../contextos/AutenticacaoContext";

type Etapa = "email" | "link" | "senha" | "concluido";

export default function RecuperarSenha() {
  const { recuperandoSenha, concluirRecuperacao, sair } = useAutenticacao();
  const [etapa, setEtapa] = useState<Etapa>(
    recuperandoSenha ? "senha" : "email",
  );
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [esperaAte, setEsperaAte] = useState(0);
  const emAndamento = useRef(false);

  async function executar(acao: () => Promise<void>) {
    if (emAndamento.current) return;
    emAndamento.current = true;
    setOcupado(true);
    setMensagem("");
    try {
      await acao();
    } catch {
      setMensagem(
        "Não foi possível conectar. Confira sua internet e tente novamente.",
      );
    } finally {
      emAndamento.current = false;
      setOcupado(false);
    }
  }

  async function enviarEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMensagem("Informe um endereço de e-mail válido.");
      return;
    }
    if (Date.now() < esperaAte) {
      setMensagem("Aguarde um minuto antes de solicitar outro e-mail.");
      return;
    }
    await executar(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setMensagem(
          error.status === 429
            ? "Muitas solicitações. Aguarde alguns minutos e tente novamente."
            : "Não foi possível solicitar a recuperação. Tente novamente mais tarde.",
        );
        return;
      }
      setEsperaAte(Date.now() + 60_000);
      setEtapa("link");
    });
  }

  async function validarLink() {
    let token: string;
    try {
      token = extrairTokenRecuperacao(
        link,
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
      );
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Confira o link recebido.",
      );
      return;
    }
    await executar(async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });
      if (error || !data.session) {
        setMensagem(
          "Este link não pôde ser validado. Ele pode ter expirado ou já ter sido usado. Solicite um novo e-mail.",
        );
        return;
      }
      setLink("");
      setEtapa("senha");
    });
  }

  async function salvarSenha() {
    const erro = validarNovaSenha(senha, confirmacao);
    if (erro) {
      setMensagem(erro);
      return;
    }
    await executar(async () => {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        setMensagem(
          error.code === "same_password"
            ? "Escolha uma senha diferente da anterior."
            : "Não foi possível alterar a senha. Confira se ela atende aos requisitos ou solicite um novo link.",
        );
        return;
      }
      setSenha("");
      setConfirmacao("");
      concluirRecuperacao();
      setEtapa("concluido");
    });
  }

  function sairDaTela() {
    if (etapa === "senha") {
      Alert.alert("Cancelar recuperação?", "A senha continuará a mesma.", [
        { text: "Continuar", style: "cancel" },
        {
          text: "Sair",
          onPress: () => {
            void executar(async () => {
              await sair();
              router.replace("/");
            });
          },
        },
      ]);
    } else router.replace("/");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Decoracao paisagem={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable
            onPress={sairDaTela}
            disabled={ocupado}
            accessibilityRole="button"
            style={styles.back}
          >
            <Text style={styles.link}>← Voltar</Text>
          </Pressable>
          <Cabecalho />
          <Text style={styles.title}>
            {etapa === "concluido" ? "Senha atualizada" : "Recupere sua conta"}
          </Text>
          {etapa === "email" && (
            <>
              <Text style={styles.description}>
                Informe o e-mail da sua conta para receber um link de
                recuperação.
              </Text>
              <Text style={styles.field}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={!ocupado}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#7C827A"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                accessibilityLabel="E-mail da conta"
              />
            </>
          )}
          {etapa === "link" && (
            <>
              <Text style={styles.description}>
                Se houver uma conta com esse e-mail, você receberá a mensagem.
                Confira também a pasta de spam.
              </Text>
              <Text style={styles.description}>
                Copie o endereço do botão de recuperação no e-mail e cole
                abaixo. No computador, use “Copiar endereço do link”.
              </Text>
              <Text style={styles.field}>Link recebido por e-mail</Text>
              <TextInput
                style={styles.input}
                value={link}
                onChangeText={setLink}
                editable={!ocupado}
                placeholder="https://…"
                placeholderTextColor="#7C827A"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Link de recuperação"
                textContentType="none"
              />
              <Pressable
                disabled={ocupado}
                onPress={() => {
                  setLink("");
                  setMensagem("");
                  setEtapa("email");
                }}
                accessibilityRole="button"
                style={styles.back}
              >
                <Text style={styles.link}>Solicitar outro e-mail</Text>
              </Pressable>
            </>
          )}
          {etapa === "senha" && (
            <>
              <Text style={styles.description}>
                Link validado. Escolha uma senha com pelo menos 8 caracteres.
              </Text>
              <Text style={styles.field}>Nova senha</Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                editable={!ocupado}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                accessibilityLabel="Nova senha"
              />
              <Text style={styles.field}>Confirmar nova senha</Text>
              <TextInput
                style={styles.input}
                value={confirmacao}
                onChangeText={setConfirmacao}
                editable={!ocupado}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                accessibilityLabel="Confirmar nova senha"
              />
            </>
          )}
          {etapa === "concluido" && (
            <Text style={styles.description}>
              Sua nova senha foi salva. Você já pode continuar sua jornada.
            </Text>
          )}
          {!!mensagem && (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.error}
            >
              {mensagem}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: ocupado }}
            disabled={ocupado}
            style={({ pressed }) => [
              styles.button,
              (pressed || ocupado) && { opacity: 0.65 },
            ]}
            onPress={
              etapa === "email"
                ? enviarEmail
                : etapa === "link"
                  ? validarLink
                  : etapa === "senha"
                    ? salvarSenha
                    : () => router.replace("/inicio")
            }
          >
            <Text style={styles.buttonText}>
              {ocupado
                ? "Aguarde..."
                : etapa === "email"
                  ? "Enviar recuperação"
                  : etapa === "link"
                    ? "Validar link"
                    : etapa === "senha"
                      ? "Salvar nova senha"
                      : "Abrir meu passaporte"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F5EC" },
  content: { width: "100%", maxWidth: 600, alignSelf: "center", flexGrow: 1, padding: 20, paddingBottom: 40 },
  back: { alignSelf: "flex-start", paddingVertical: 11, marginBottom: 20 },
  link: { color: "#183F35", fontSize: 14, fontWeight: "600" },
  label: {
    color: "#C76B48",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: { color: "#183F35", fontSize: 29, fontWeight: "800", marginTop: 20 },
  description: {
    color: "#53645B",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 16,
  },
  field: {
    color: "#183F35",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    color: "#183F35",
    borderWidth: 1,
    borderColor: "#DED9CE",
    borderRadius: 9,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#183F35",
    borderRadius: 9,
    padding: 13,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  error: { color: "#9B3529", fontSize: 13, lineHeight: 22, marginTop: 20 },
});
