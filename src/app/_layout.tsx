import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import {
  AutenticacaoProvider,
  useAutenticacao,
} from "../contextos/AutenticacaoContext";
import { VisitasProvider } from "../contextos/VisitasContext";

function Navegacao() {
  const { sessao, carregando, erro } = useAutenticacao();

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#183F35" />
      </View>
    );
  }

  const conectado = sessao !== null && erro === null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recuperar-senha" />

      <Stack.Protected guard={!conectado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>

      <Stack.Protected guard={conectado}>
        <Stack.Screen name="inicio" />
        <Stack.Screen name="visitas" />
        <Stack.Screen name="nova-visita" />
        <Stack.Screen name="detalhes" />
        <Stack.Screen name="editar-visita" />
        <Stack.Screen name="passaporte" />
        <Stack.Screen name="perfil" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  const [fontes, erroFontes] = useFonts({
    Simbolos: require("@expo-google-fonts/material-symbols/400Regular/MaterialSymbols_400Regular.ttf"),
  });
  if (!fontes && !erroFontes)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#123E34" />
      </View>
    );
  return (
    <AutenticacaoProvider>
      <VisitasProvider>
        <View style={styles.workspace}>
          <View style={styles.appFrame}>
            <StatusBar style="dark" />
            <Navegacao />
          </View>
        </View>
      </VisitasProvider>
    </AutenticacaoProvider>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    backgroundColor: "#E9E2D5",
    alignItems: "center",
    justifyContent: "center",
  },
  appFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    ...(Platform.OS === "web"
      ? {
          maxWidth: 600,


          borderRadius: 22,
          overflow: "hidden" as const,
          borderWidth: 1,
          borderColor: "#D8D1C3",
        }
      : {}),
  },
  loading: {
    flex: 1,
    backgroundColor: "#F7F1E5",
    justifyContent: "center",
    alignItems: "center",
  },
});
