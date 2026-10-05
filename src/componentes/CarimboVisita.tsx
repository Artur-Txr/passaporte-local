import { StyleSheet, Text, View } from 'react-native';
import type { Visita } from '../dados/visitas';

type CarimboVisitaProps = {
  visita: Visita;
};

const identidades: Record<
  string,
  { cor: string; sigla: string }
> = {
  Parque: {
    cor: '#183F35',
    sigla: 'PA',
  },
  Museu: {
    cor: '#73528A',
    sigla: 'MU',
  },
  Cafeteria: {
    cor: '#A65D36',
    sigla: 'CA',
  },
  Outro: {
    cor: '#426B85',
    sigla: 'OU',
  },
};

export default function CarimboVisita({
  visita,
}: CarimboVisitaProps) {
  const identidade =
    identidades[visita.categoria] ?? identidades.Outro;

  return (
    <View
      accessible
      accessibilityLabel={
        `Carimbo de ${visita.lugar}, ` +
        `${visita.cidade}, ${visita.uf}, ` +
        `${visita.categoria}, visitado em ${visita.data}`
      }
      style={[
        styles.carimbo,
        { borderColor: identidade.cor },
      ]}
    >
      <View
        style={[
          styles.anelInterno,
          { borderColor: identidade.cor },
        ]}
      >
        <Text
          style={[
            styles.titulo,
            { color: identidade.cor },
          ]}
        >
          PASSAPORTE LOCAL
        </Text>

        <Text
          style={[
            styles.sigla,
            { color: identidade.cor },
          ]}
        >
          {identidade.sigla}
        </Text>

        <Text
          style={[
            styles.categoria,
            { color: identidade.cor },
          ]}
        >
          {visita.categoria.toUpperCase()}
        </Text>

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.cidade,
            { color: identidade.cor },
          ]}
        >
          {visita.cidade} · {visita.uf}
        </Text>

        <Text
          style={[
            styles.data,
            { color: identidade.cor },
          ]}
        >
          {visita.data}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carimbo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    padding: 6,
    backgroundColor: '#F7F1E5',
    transform: [{ rotate: '-6deg' }],
  },
  anelInterno: {
    flex: 1,
    borderRadius: 90,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  titulo: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sigla: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 6,
  },
  categoria: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  cidade: {
    maxWidth: '100%',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  data: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
});