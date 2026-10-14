import { mensagemErroAuth } from "../lib/errosAutenticacao";
import Icone from "../componentes/Icone";
import CampoTexto from "../componentes/CampoTexto";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  const envioEmAndamento = useRef(false);
  const [mensagem, setMensagem] = useState('');
  function avisar(titulo: string, texto: string, botoes?: Parameters<typeof Alert.alert>[2], opcoes?: Parameters<typeof Alert.alert>[3]) {
    setMensagem(`${titulo}. ${texto}`);
    if (Platform.OS !== 'web') Alert.alert(titulo, texto, botoes, opcoes);
  }


  async function entrar() {
    if (envioEmAndamento.current) {
      return;
    }

    setMensagem("");
    const emailFormatado = email.trim();

    if (!emailFormatado || !senha) {
      avisar("Preencha os campos", "Informe seu e-mail e sua senha.");
      return;
    }

    envioEmAndamento.current = true;
    setEntrando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailFormatado,
        password: senha,
      });

      if (error) {
        avisar(
          "Não foi possível entrar",
          mensagemErroAuth(error),
        );
        return;
      }

      if (!data.session) {
        avisar(
          "Não foi possível entrar",
          "Nenhuma sessão foi recebida. Tente novamente.",
        );
        return;
      }

      router.replace("/inicio");
    } catch {
      avisar(
        "Falha de conexão",
        "Não foi possível conectar. Confira sua internet e tente novamente.",
      );
    } finally {
      envioEmAndamento.current = false;
      setEntrando(false);
    }
  }

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Decoracao paisagem={true} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Cabecalho />
          {!!mensagem && <Text accessibilityLiveRegion="polite" style={{ color: "#9B4028", marginVertical: 12 }}>{mensagem}</Text>}

          <Text style={styles.title}>Que bom ter{"\n"}você aqui</Text>

          <Text style={styles.description}>Entre no seu passaporte.</Text>

          <Text style={styles.fieldLabel}>E-mail</Text>

          <CampoTexto icone="email"
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#7C827A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!entrando}
          />

          <Text style={styles.fieldLabel}>Senha</Text>

          <View style={{ position: "relative" }}>
            <CampoTexto icone="senha"
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="Digite sua senha"
              placeholderTextColor="#7C827A"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              editable={!entrando}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                mostrarSenha ? "Ocultar senha" : "Mostrar senha"
              }
              onPress={() => setMostrarSenha((v) => !v)}
              style={{ position: "absolute", right: 8, top: 4, padding: 8 }}
            >
              <Icone nome={mostrarSenha ? "olhoFechado" : "olho"} tamanho={20} cor="#53645B" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/recuperar-senha")}
            disabled={entrando}
            accessibilityRole="button"
            style={{ alignSelf: "flex-end", paddingVertical: 12 }}
          >
            <Text
              style={{
                color: "#BC592F",
                fontSize: 12,
                textDecorationLine: "underline",
              }}
            >
              Esqueci minha senha
            </Text>
          </Pressable>
          <Pressable
            onPress={entrar}
            disabled={entrando}
            accessibilityRole="button"
            accessibilityState={{ disabled: entrando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || entrando) && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {entrando ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              marginTop: 18,
            }}
          >
            <Text style={{ color: "#53645B", fontSize: 12 }}>
              Ainda não tem conta?
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={entrando}
              onPress={() => router.push("/cadastro")}
            >
              <Text
                style={{
                  color: "#BC592F",
                  fontSize: 12,
                  textDecorationLine: "underline",
                }}
              >
                Criar conta
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EC",
  },
  keyboard: {
    flex: 1,
  },
  content: { width: "100%", maxWidth: 600, alignSelf: "center",
    flexGrow: 1,
    padding: 20,
    paddingBottom: 165,
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
    fontSize: 29,
    fontWeight: "800",
    marginTop: 12,
  },
  description: {
    color: "#53645B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
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
    paddingVertical: 11,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#183F35",
    borderRadius: 18,
    padding: 13,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  signupDescription: {
    color: "#53645B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 28,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: "#183F35",
    borderRadius: 18,
    padding: 13,
    alignItems: "center",
    marginTop: 12,
  },
  signupText: {
    color: "#183F35",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
