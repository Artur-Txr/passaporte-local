import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Não depende da fonte de ícones: esta tela também aparece enquanto a fonte carrega.
export default function TelaCarregamento() {
  const movimento = useRef(new Animated.Value(0)).current;
  const [reduzirMovimento, setReduzirMovimento] = useState(true);
  const [ativo, setAtivo] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let montado = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(valor => { if (montado) setReduzirMovimento(valor); }).catch(() => {});
    const preferencia = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzirMovimento);
    const estado = AppState.addEventListener('change', valor => setAtivo(valor === 'active'));
    return () => { montado = false; preferencia.remove(); estado.remove(); };
  }, []);
  useEffect(() => {
    movimento.setValue(0);
    if (reduzirMovimento || !ativo) return;
    const animacao = Animated.loop(Animated.sequence([
      Animated.timing(movimento, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.timing(movimento, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
    ]));
    animacao.start();
    return () => animacao.stop();
  }, [movimento, reduzirMovimento, ativo]);
  return <SafeAreaView style={styles.screen}>
    <View style={styles.body} accessibilityRole="progressbar" accessibilityLabel="Preparando seu passaporte" accessibilityState={{ busy: true }}>
      <Animated.View style={{ transform: [{ scale: movimento.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}>
        <Image source={require('../../assets/prototipo/logo-fiel.png')} resizeMode="contain" style={styles.logo} accessible={false} />
      </Animated.View>
      <Text style={styles.title}>Sua próxima história começa aqui.</Text>
      <View style={styles.trajeto} accessible={false} importantForAccessibility="no-hide-descendants">
        <View style={styles.linha} />
        {[0, 1, 2, 3, 4].map(ponto => <View key={ponto} style={styles.ponto} />)}
        <Animated.View style={[styles.marcador, { transform: [{ translateX: movimento.interpolate({ inputRange: [0, 1], outputRange: [0, 144] }) }] }]} />
      </View>
      <Text style={styles.message} accessibilityLiveRegion="polite">Preparando seu passaporte…</Text>
    </View>
    <Text style={styles.footer}>Cada lugar, uma nova história.</Text>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F5EC', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  body: { width: '100%', maxWidth: 380, alignItems: 'center', gap: 24 },
  logo: { width: 230, maxWidth: '100%', height: 86 },
  title: { fontSize: 19, lineHeight: 27, fontWeight: '600', color: '#123E34', textAlign: 'center', maxWidth: 270 },
  trajeto: { width: 156, height: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linha: { position: 'absolute', left: 6, right: 6, height: 1, backgroundColor: '#C7CEBB' },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C7CEBB' },
  marcador: { position: 'absolute', left: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#BC592F', borderWidth: 2, borderColor: '#F8F5EC' },
  message: { fontSize: 13, lineHeight: 20, color: '#5B635C', textAlign: 'center' },
  footer: { marginTop: 40, fontSize: 12, lineHeight: 18, color: '#687958', textAlign: 'center' },
});
