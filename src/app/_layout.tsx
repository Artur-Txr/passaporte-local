import { paleta } from "../lib/paleta";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Platform, StyleSheet, View } from "react-native";
import TelaCarregamento from "../componentes/TelaCarregamento";
import {
  AutenticacaoProvider,
  useAutenticacao,
} from "../contextos/AutenticacaoContext";
import { VisitasProvider } from "../contextos/VisitasContext";
import { FeedbackProvider } from '../contextos/FeedbackContext';

function Navegacao({ fontesProntas }: { fontesProntas: boolean }) {
  const { sessao, carregando, erro } = useAutenticacao();

  if (carregando || !fontesProntas) return <TelaCarregamento />;

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
        <Stack.Screen name="explorar" />
        <Stack.Screen name="publicacao" />
        <Stack.Screen name="perfil-publico" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="notificacoes" />
        <Stack.Screen name="mapa" />
        <Stack.Screen name="nova-visita" />
        <Stack.Screen name="detalhes" />
        <Stack.Screen name="editar-visita" />
        <Stack.Screen name="passaporte" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="sobre" />
        <Stack.Screen name="editar-perfil" />
        <Stack.Screen name="cidade" />
        <Stack.Screen name="colecao-prototipo" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  const [fontes, erroFontes] = useFonts({
    Manrope: require("../../assets/identidade/Manrope.ttf"),
    Simbolos: require("../../assets/identidade/Simbolos.ttf"),
  });
  return (
    <AutenticacaoProvider>
      <FeedbackProvider>
      <VisitasProvider>
        <View style={styles.workspace}>
          <View style={styles.appFrame}>
            <StatusBar style="dark" />
            <Navegacao fontesProntas={fontes || !!erroFontes} />
          </View>
        </View>
      </VisitasProvider>
      </FeedbackProvider>
    </AutenticacaoProvider>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    backgroundColor: paleta.claro,
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
          borderColor: paleta.borda,
        }
      : {}),
  },
  loading: {
    flex: 1,
    backgroundColor: paleta.papel,
    justifyContent: "center",
    alignItems: "center",
  },
});
