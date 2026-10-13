import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { obterUrlFoto } from '../servicos/fotosService';

type FotoVisitaProps = {
  caminho: string | null;
  compacto?: boolean;
};

export default function FotoVisita({
  caminho,
  compacto = false,
}: FotoVisitaProps) {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id ?? null;

  const [ampliada, setAmpliada] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    setUrl(null);
    setErro(false);

    if (!usuarioId || !caminho) {
      setCarregando(false);
      return;
    }

    setCarregando(true);

    async function carregarFoto() {
      try {
        const endereco = await obterUrlFoto(
          usuarioId!,
          caminho!,
        );

        if (ativo) {
          setUrl(endereco);
        }
      } catch {
        if (ativo) {
          setErro(true);
          setCarregando(false);
        }
      }
    }

    void carregarFoto();

    return () => {
      ativo = false;
    };
  }, [usuarioId, caminho, tentativa]);

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
      <Modal visible={ampliada && !!url} transparent animationType="fade" onRequestClose={() => setAmpliada(false)}>
        <View style={{ flex: 1, backgroundColor: "#000E", justifyContent: "center", padding: 16 }}>
          {url && <Image source={{ uri: url }} style={{ width: "100%", height: "80%" }} resizeMode="contain" accessibilityLabel="Foto completa da visita" />}
          <Pressable accessibilityRole="button" onPress={() => setAmpliada(false)} style={{ alignSelf: "center", padding: 16 }}><Text style={{ color: "#FFF", fontWeight: "700" }}>Fechar foto</Text></Pressable>
        </View>
      </Modal>
      {url && !erro && (
        <Pressable accessibilityRole="button" accessibilityLabel="Ampliar foto da visita" onPress={() => setAmpliada(true)}>
        <Image
          key={url}
          source={{ uri: url }}
          style={[styles.image, compacto && { height: 140, aspectRatio: undefined }]}
          resizeMode="cover"
          accessibilityLabel="Foto da visita"
          onLoad={() => setCarregando(false)}
          onError={() => {
            setErro(true);
            setCarregando(false);
          }}
        />
        </Pressable>
      )}

      {carregando && !erro && (
        <View style={styles.status}>
          <ActivityIndicator size="large" color="#183F35" />
          <Text style={styles.message}>Carregando foto...</Text>
        </View>
      )}

      {erro && (
        <View style={styles.status}>
          <Text style={styles.message}>
            Não foi possível carregar a foto.
          </Text>

          <Pressable
            onPress={() => setTentativa((valor) => valor + 1)}
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
    aspectRatio: 1.35,
    borderRadius: 16,
    backgroundColor: '#F7F1E5',
  },
  status: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 14,
  },
  message: {
    color: '#53645B',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#183F35',
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