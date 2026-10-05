import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  AutenticacaoProvider,
  useAutenticacao,
} from '../contextos/AutenticacaoContext';
import {
  VisitasProvider,
} from '../contextos/VisitasContext';

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

      <Stack.Protected guard={!conectado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>

      <Stack.Protected guard={conectado}>
        <Stack.Screen name="inicio" />
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
  return (
    <AutenticacaoProvider>
      <VisitasProvider>
        <StatusBar style="dark" />
        <Navegacao />
      </VisitasProvider>
    </AutenticacaoProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#F7F1E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});