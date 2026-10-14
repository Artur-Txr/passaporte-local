import { StyleSheet, Text, View } from 'react-native';
import type { Visita } from '../dados/visitas';

const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function dataCarimbo(data: string) {
  const [dia, mes, ano] = data.split('/');
  return meses[Number(mes) - 1] ? `${dia} ${meses[Number(mes) - 1]} ${ano}` : data;
}
const tinta = '#687958';

function Paisagem() {
  return <View style={styles.paisagem}>
    {[{ x: 4, h: 22 }, { x: 21, h: 37 }, { x: 39, h: 49 }, { x: 58, h: 29 }, { x: 76, h: 20 }].map(({ x, h }) =>
      <View key={x} style={[styles.predio, { left: x, height: h }]}>
        {[0, 1, 2].map(i => <View key={i} style={styles.janelas}><View style={styles.janela} /><View style={styles.janela} /></View>)}
      </View>)}
    {[7, 83].map(x => <View key={x} style={[styles.arvore, { left: x }]}>
      <View style={styles.copa} /><View style={styles.tronco} />
    </View>)}
    <View style={styles.chao} />
  </View>;
}

export default function CarimboVisita({ visita }: { visita: Visita }) {
  return <View accessible accessibilityLabel={`Carimbo de ${visita.lugar}, ${visita.cidade}, ${visita.uf}, ${visita.categoria}, visitado em ${visita.data}`} style={styles.carimbo}>
    <View style={styles.anelInterno} />
    <View style={styles.anelFalhado} />
    {'VISITADO'.split('').map((letra, i) => {
      const angulo = (i - 3.5) * 10;
      const rad = angulo * Math.PI / 180;
      return <Text key={i} style={[styles.letra, { left: 74 + Math.sin(rad) * 65, top: 76 - Math.cos(rad) * 65, transform: [{ rotate: `${angulo}deg` }] }]}>{letra}</Text>;
    })}
    <View style={styles.miolo}>
      <Paisagem />
      <Text style={styles.data}>{dataCarimbo(visita.data)}</Text>
      <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.cidade}>{visita.lugar.replace(/^DEMONSTRAÇÃO\s*[—-]\s*/i, "").toUpperCase()}</Text>
    </View>
    <Text style={[styles.estrela, { left: 11 }]}>✦</Text>
    <Text style={[styles.estrela, { right: 11 }]}>✦</Text>
  </View>;
}

const styles = StyleSheet.create({
  carimbo: { width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderColor: tinta, backgroundColor: 'transparent', transform: [{ rotate: '-9deg' }] },
  anelInterno: { position: 'absolute', inset: 5, borderRadius: 85, borderWidth: 1, borderColor: tinta },
  anelFalhado: { position: 'absolute', inset: 2, borderRadius: 88, borderWidth: 1, borderStyle: 'dashed', borderColor: '#929D80' },
  letra: { position: 'absolute', width: 28, textAlign: 'center', fontSize: 15, fontWeight: '800', color: tinta },
  miolo: { position: 'absolute', left: 26, right: 26, top: 43, alignItems: 'center' },
  paisagem: { width: 104, height: 52 },
  predio: { position: 'absolute', bottom: 3, width: 13, backgroundColor: tinta, paddingTop: 4, gap: 4 },
  janelas: { flexDirection: 'row', justifyContent: 'space-evenly' },
  janela: { width: 2, height: 3, backgroundColor: '#EEECDD' },
  arvore: { position: 'absolute', bottom: 4, width: 23, alignItems: 'center' },
  copa: { width: 23, height: 24, borderRadius: 12, backgroundColor: tinta, borderWidth: 2, borderColor: '#F8F5EC' },
  tronco: { width: 3, height: 12, backgroundColor: tinta },
  chao: { position: 'absolute', bottom: 0, width: 104, height: 2, backgroundColor: tinta },
  data: { fontSize: 14, fontWeight: '800', color: tinta, marginTop: 5, letterSpacing: 0.4 },
  cidade: { fontSize: 12, lineHeight: 14, fontWeight: '700', color: tinta, textAlign: 'center', marginTop: 4, maxWidth: 128 },
  estrela: { position: 'absolute', top: 79, fontSize: 12, color: tinta },
});
