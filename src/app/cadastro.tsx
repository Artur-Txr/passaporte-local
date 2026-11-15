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

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  const envioEmAndamento = useRef(false);
  const [mensagem, setMensagem] = useState('');
  function avisar(titulo: string, texto: string, botoes?: Parameters<typeof Alert.alert>[2], opcoes?: Parameters<typeof Alert.alert>[3]) {
    setMensagem(`${titulo}. ${texto}`);
    if (Platform.OS !== 'web') Alert.alert(titulo, texto, botoes, opcoes);
  }


  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  }

  async function cadastrar() {
    if (envioEmAndamento.current) {
      return;
    }

    const nomeFormatado = nome.trim();
    setMensagem("");
    const emailFormatado = email.trim();

    if (!nomeFormatado || !emailFormatado || !senha || !confirmacao) {
      avisar(
        "Preencha os campos",
        "Informe seu nome, e-mail e os dois campos de senha.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado)) {
      avisar("Confira o e-mail", "Informe um endereço de e-mail válido.");
      return;
    }

    if (senha.length < 8) {
      avisar("Escolha uma senha maior", "Use pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      avisar(
        "As senhas são diferentes",
        "Digite a mesma senha nos dois campos.",
      );
      return;
    }

    envioEmAndamento.current = true;
    setCadastrando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailFormatado,
        password: senha,
        options: {
          data: {
            nome: nomeFormatado,
          },
        },
      });

      if (error) {
        avisar("Não foi possível cadastrar", mensagemErroAuth(error));
        return;
      }

      setSenha("");
      setConfirmacao("");

      if (data.session) {
        router.replace("/inicio");
      } else {
        avisar(
          "Confira seu e-mail",
          "Se o cadastro precisar de confirmação, você receberá um e-mail. Confirme sua conta antes de entrar.",
          [
            {
              text: "Ir para login",
              onPress: () => router.replace("/login"),
            },
          ],
          { cancelable: false },
        );
      }
    } catch {
      avisar(
        "Falha de conexão",
        "Confira sua internet e tente novamente.",
      );
    } finally {
      envioEmAndamento.current = false;
      setCadastrando(false);
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
          <Cabecalho alinharInicio />
          {!!mensagem && <Text accessibilityLiveRegion="polite" style={{ color: "#9B4028", marginVertical: 12 }}>{mensagem}</Text>}

          <Text style={styles.title}>Crie seu{"\n"}passaporte.</Text>

          <Text style={styles.description}>Um lugar para guardar as suas histórias.</Text>

          <Text style={styles.fieldLabel}>Nome</Text>

          <CampoTexto icone="perfil"
            style={styles.input}
            placeholder="Como você se chama?"
            placeholderTextColor={paleta.suave}
            value={nome}
            onChangeText={setNome}
            maxLength={80}
            autoCapitalize="words"
            autoComplete="name"
            editable={!cadastrando}
          />

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
            editable={!cadastrando}
          />

          <Text style={styles.fieldLabel}>Senha</Text>

          <View style={{ position: "relative" }}>
            <CampoTexto icone="senha"
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="Pelo menos 8 caracteres"
              placeholderTextColor={paleta.suave}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!cadastrando}
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

          <Text style={styles.fieldLabel}>Confirmar senha</Text>

          <View style={{ position: "relative" }}>
            <CampoTexto icone="senha"
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="Digite a senha novamente"
              placeholderTextColor={paleta.suave}
              value={confirmacao}
              onChangeText={setConfirmacao}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!cadastrando}
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
            onPress={cadastrar}
            disabled={cadastrando}
            accessibilityRole="button"
            accessibilityState={{ disabled: cadastrando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || cadastrando) && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {cadastrando ? "Criando conta..." : "Criar conta"}
            </Text>
          </Pressable>
          <BotaoEntrarGoogle bloqueado={cadastrando} controle={envioEmAndamento} aoOcupar={setCadastrando} aoErro={setMensagem} />

          <Pressable
            disabled={cadastrando}
            onPress={() => router.replace("/login")}
            style={{ alignItems: "center", padding: 16 }}
          >
            <Text style={{ color: "#B74D39", fontSize: 13 }}>
              Já tenho conta: Entrar
            </Text>
          </Pressable>
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
  pressed: {
    opacity: 0.75,
  },
});
