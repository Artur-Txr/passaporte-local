import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  selecionarFoto,
  type FotoSelecionada,
} from '../servicos/selecaoFotoService';

type SeletorFotoProps = {
  foto: FotoSelecionada | null;
  onChange: (foto: FotoSelecionada | null) => void;
  desabilitado?: boolean;
  onSelecionandoChange?: (selecionando: boolean) => void;
};

export default function SeletorFoto({
  foto,
  onChange,
  desabilitado = false,
  onSelecionandoChange,
}: SeletorFotoProps) {
  const [selecionando, setSelecionando] = useState(false);
  const selecaoEmAndamento = useRef(false);

  const bloqueado = desabilitado || selecionando;

  async function escolherFoto() {
    if (desabilitado || selecaoEmAndamento.current) {
      return;
    }

    selecaoEmAndamento.current = true;
    setSelecionando(true);
    onSelecionandoChange?.(true);

    try {
      const escolhida = await selecionarFoto();

      if (escolhida) {
        onChange(escolhida);
      }
    } catch (erro) {
      Alert.alert(
        'Não foi possível selecionar a foto',
        erro instanceof Error
          ? erro.message
          : 'Tente novamente e escolha uma imagem JPEG, PNG ou WebP de até 5 MB.',
      );
    } finally {
      selecaoEmAndamento.current = false;
      setSelecionando(false);
      onSelecionandoChange?.(false);
    }
  }

  return (
    <View style={styles.container}>
      {foto ? (
        <Image
          source={{ uri: foto.uri }}
          style={styles.preview}
          resizeMode="cover"
          accessibilityLabel="Prévia da foto escolhida para a visita"
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nenhuma foto selecionada
          </Text>
        </View>
      )}

      <Pressable
        onPress={escolherFoto}
        disabled={bloqueado}
        accessibilityRole="button"
        accessibilityState={{ disabled: bloqueado }}
        style={({ pressed }) => [
          styles.chooseButton,
          (pressed || bloqueado) && styles.dimmed,
        ]}
      >
        {selecionando ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.chooseText}>Selecionando...</Text>
          </View>
        ) : (
          <Text style={styles.chooseText}>
            {foto ? 'Trocar foto' : 'Escolher foto da galeria'}
          </Text>
        )}
      </Pressable>

      {foto && (
        <Pressable
          onPress={() => onChange(null)}
          disabled={bloqueado}
          accessibilityRole="button"
          accessibilityState={{ disabled: bloqueado }}
          style={({ pressed }) => [
            styles.removeButton,
            (pressed || bloqueado) && styles.dimmed,
          ]}
        >
          <Text style={styles.removeText}>Remover foto</Text>
        </Pressable>
      )}

      <Text style={styles.hint}>
        Foto opcional. JPEG, PNG ou WebP de até 5 MB.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E8DDCC',
  },
  empty: {
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DED9CE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#53645B',
    fontSize: 15,
    textAlign: 'center',
  },
  chooseButton: {
    backgroundColor: '#183F35',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  chooseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#A33B32',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  removeText: {
    color: '#A33B32',
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    color: '#53645B',
    fontSize: 13,
    lineHeight: 20,
  },
  dimmed: {
    opacity: 0.6,
  },
});