import { Pressable, StyleSheet, Text, View } from 'react-native';

type AvaliacaoEstrelasProps = {
  valor: number | null;
  onChange?: (valor: number | null) => void;
  desabilitado?: boolean;
};

export default function AvaliacaoEstrelas({
  valor,
  onChange,
  desabilitado = false,
}: AvaliacaoEstrelasProps) {
  const editavel = onChange !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((nota) => {
          const selecionada = valor !== null && nota <= valor;

          const estrela = (
            <Text
              style={[
                styles.estrela,
                selecionada && styles.estrelaSelecionada,
              ]}
            >
              {selecionada ? '★' : '☆'}
            </Text>
          );

          return editavel ? (
            <Pressable
              key={nota}
              onPress={() => onChange?.(nota)}
              disabled={desabilitado}
              accessibilityRole="button"
              accessibilityLabel={`Avaliar com ${nota} ${
                nota === 1 ? 'estrela' : 'estrelas'
              }`}
              accessibilityState={{
                selected: valor === nota,
                disabled: desabilitado,
              }}
              style={({ pressed }) => [
                styles.botaoEstrela,
                (pressed || desabilitado) && styles.atenuado,
              ]}
            >
              {estrela}
            </Pressable>
          ) : (
            <View key={nota} style={styles.botaoEstrela}>
              {estrela}
            </View>
          );
        })}
      </View>

      <Text style={styles.descricao}>
        {valor === null
          ? 'Sem avaliação'
          : `${valor} de 5 estrelas`}
      </Text>

      {editavel && valor !== null && (
        <Pressable
          onPress={() => onChange?.(null)}
          disabled={desabilitado}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.botaoLimpar,
            (pressed || desabilitado) && styles.atenuado,
          ]}
        >
          <Text style={styles.textoLimpar}>Remover avaliação</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  estrelas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  botaoEstrela: {
    minWidth: 44,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estrela: {
    color: '#53645B',
    fontSize: 36,
  },
  estrelaSelecionada: {
    color: '#C76B48',
  },
  descricao: {
    color: '#53645B',
    fontSize: 14,
    marginTop: 8,
  },
  botaoLimpar: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
  },
  textoLimpar: {
    color: '#183F35',
    fontSize: 14,
    fontWeight: '700',
  },
  atenuado: {
    opacity: 0.6,
  },
});