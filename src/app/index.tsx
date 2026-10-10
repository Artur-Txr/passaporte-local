import { Redirect, router } from "expo-router";
import { Image, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { Logo, cores, visual } from "../componentes/Design";
export default function Welcome() {
  const { sessao, carregando, erro, recuperandoSenha } = useAutenticacao();
  if (!carregando && sessao && recuperandoSenha)
    return <Redirect href="/recuperar-senha" />;
  if (!carregando && sessao && !erro) return <Redirect href="/inicio" />;
  return (
    <SafeAreaView style={visual.screen}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Logo />
        <Image
          source={require("../../assets/prototipo/abertura.png")}
          style={{ width: "100%", height: 345, marginTop: 8 }}
          resizeMode="contain"
        />
        <Text
          style={[
            visual.title,
            { textAlign: "center", fontSize: 29, marginTop: 12 },
          ]}
        >
          Suas descobertas,{"\n"}sempre com você
        </Text>
        <Text
          style={[
            visual.subtitle,
            { textAlign: "center", maxWidth: 290, marginTop: 8 },
          ]}
        >
          Guarde os lugares que fazem parte da sua história.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={carregando}
          onPress={() => router.push("/cadastro")}
          style={[visual.button, { width: "100%", marginTop: 20 }]}
        >
          <Text style={visual.buttonText}>
            {carregando ? "Carregando..." : "Começar"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/login")}
          style={{ padding: 14 }}
        >
          <Text
            style={{ color: cores.laranja, fontWeight: "600", fontSize: 13 }}
          >
            Já tenho conta
          </Text>
        </Pressable>
        {!!erro && <Text style={visual.subtitle}>{erro}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
