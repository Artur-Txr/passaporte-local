import { Redirect, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { cores, visual } from "../componentes/Design";
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
          paddingTop: 8,
          paddingBottom: 24,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 440, alignItems: "center" }}>
        <Image
          source={require("../../assets/prototipo/abertura-completa.png")}
          style={{ width: "100%", aspectRatio: 358 / 469 }}
          resizeMode="contain"
        />
        <Text
          style={[
            visual.title,
            { textAlign: "center", fontSize: 29, marginTop: 8, paddingHorizontal: 12 },
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
          style={[visual.button, { alignSelf: "stretch", marginHorizontal: 16, marginTop: 20, borderRadius: 18 }]}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
