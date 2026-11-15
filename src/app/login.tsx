import BotaoEntrarGoogle from '../componentes/BotaoEntrarGoogle';
import { paleta } from "../lib/paleta";
import Text from "../componentes/Texto";
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

          <Text style={styles.title}>Bom ter você{"\n"}por aqui.</Text>

          <Text style={styles.description}>Entre para continuar a sua jornada.</Text>

          <Text style={styles.fieldLabel}>E-mail</Text>

          <CampoTexto icone="email"
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={paleta.suave}
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
              placeholderTextColor={paleta.suave}
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
              style={{ position: "absolute", right: 4, top: 4, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
            >
              <Icone nome={mostrarSenha ? "olhoFechado" : "olho"} tamanho={20} cor={paleta.suave} />
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
                color: "#B74D39",
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

          <BotaoEntrarGoogle bloqueado={entrando} controle={envioEmAndamento} aoOcupar={setEntrando} aoErro={setMensagem} />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 5,
              marginTop: 18,
            }}
          >
            <Text style={{ color: paleta.suave, fontSize: 12 }}>
              Ainda não tem conta?
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={entrando}
              onPress={() => router.push("/cadastro")}
            >
              <Text
                style={{
                  color: "#B74D39",
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
    backgroundColor: paleta.papel,
  },
  keyboard: {
    flex: 1,
  },
  content: { width: "100%", maxWidth: 460, alignSelf: "center",
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
    paddingTop: 32,
    justifyContent: "flex-start",
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
    fontSize: 29,
    fontWeight: "800",
    marginTop: 12,
  },
  description: {
    color: paleta.suave,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
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
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 52,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: paleta.petroleo,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    padding: 15,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  signupDescription: {
    color: paleta.suave,
    fontSize: 14,
    textAlign: "center",
    marginTop: 28,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: paleta.petroleo,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    padding: 15,
    alignItems: "center",
    marginTop: 12,
  },
  signupText: {
    color: paleta.petroleo,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
