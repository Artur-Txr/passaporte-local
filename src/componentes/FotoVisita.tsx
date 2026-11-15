import { paleta } from "../lib/paleta";
import useFotoPrivada from "./useFotoPrivada";
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import GaleriaFotos from './GaleriaFotos';

type FotoVisitaProps = {
  caminho: string | null;
  compacto?: boolean;
  fotos?: string[];
};

export default function FotoVisita({
  caminho,
  compacto = false,
  fotos,
}: FotoVisitaProps) {
  const { sessao } = useAutenticacao();
  const { height } = useWindowDimensions();
  const usuarioId = sessao?.user.id ?? null;

  const [ampliada, setAmpliada] = useState(false);
  const { url, carregando, erro, tentarNovamente, falhar } = useFotoPrivada(caminho);

  if (!caminho) {
    return (
      <Text style={styles.message}>
        Nenhuma foto adicionada a esta visita.
      </Text>
    );
  }

  if (!usuarioId) {
    return null;
  }

  return (
    <View style={styles.container}>
      {ampliada && <GaleriaFotos fotos={fotos?.length ? fotos : [caminho]} inicial={caminho} fechar={() => setAmpliada(false)} />}
      {url && !erro && (
        <Pressable accessibilityRole="button" accessibilityLabel="Ampliar foto da visita" onPress={() => setAmpliada(true)}>
        <Image
          key={url}
          source={{ uri: url }}
          style={[styles.image, { height: compacto ? 140 : Math.min(210, Math.max(140, height * 0.27)) }]}
          resizeMode="cover"
          accessibilityLabel="Foto da visita"

          onError={falhar}
        />
        </Pressable>
      )}

      {url && !erro && !compacto && <Text style={[styles.message, { fontSize: 12, marginTop: 6, textAlign: 'center' }]}>Toque na foto para ampliar</Text>}

      {carregando && !erro && (
        <View style={styles.status}>
          <ActivityIndicator size="large" color={paleta.petroleo} />
          <Text style={styles.message}>Carregando foto...</Text>
        </View>
      )}

      {erro && (
        <View style={styles.status}>
          <Text style={styles.message}>
            Não foi possível carregar a foto.
          </Text>

          <Pressable
            onPress={tentarNovamente}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  image: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: paleta.papel,
  },
  status: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 14,
  },
  message: {
    color: paleta.suave,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  button: {
    backgroundColor: paleta.petroleo,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
