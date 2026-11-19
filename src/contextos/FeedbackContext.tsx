import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import CarimboVisita, { type DadosCarimbo } from '../componentes/CarimboVisita';
import Text from '../componentes/Texto';
import { paleta } from '../lib/paleta';

const FeedbackContext = createContext<(mensagem: string, carimbo?: DadosCarimbo) => void>(() => {});

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<{ id: number; texto: string; carimbo?: DadosCarimbo } | null>(null);
  const sequencia = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const avisar = useCallback((texto: string, carimbo?: DadosCarimbo) => {
    clearTimeout(temporizador.current);
    setFeedback({ id: ++sequencia.current, texto, carimbo });
    temporizador.current = setTimeout(() => setFeedback(null), carimbo ? 3600 : 4000);
  }, []);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  return <FeedbackContext.Provider value={avisar}>
    {children}
    {!!feedback?.texto && (
      <View pointerEvents="none" style={[estilos.aviso, feedback.carimbo && estilos.comCarimbo]}>
        {feedback.carimbo && <CarimboVisita key={feedback.id} visita={feedback.carimbo} animar />}
        <Text accessibilityLiveRegion="polite" style={[estilos.texto, feedback.carimbo && estilos.confirmacao]}>{feedback.texto}</Text>
      </View>
    )}
  </FeedbackContext.Provider>;
}

export const useFeedback = () => useContext(FeedbackContext);

const estilos = StyleSheet.create({
  aviso: {
    position: 'absolute', bottom: 95, alignSelf: 'center', maxWidth: '90%',
    backgroundColor: paleta.petroleo, padding: 16, borderRadius: 14, zIndex: 1000,
  },
  comCarimbo: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: paleta.papel, borderColor: paleta.borda, borderWidth: 1, elevation: 6,
  },
  texto: { color: '#FFF', fontSize: 14 },
  confirmacao: { color: paleta.petroleo, fontWeight: '800', flexShrink: 1 },
});
