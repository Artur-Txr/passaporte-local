import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Text from '../componentes/Texto';
import { paleta } from '../lib/paleta';

const FeedbackContext = createContext<(mensagem: string) => void>(() => {});

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const avisar = useCallback((texto: string) => {
    clearTimeout(temporizador.current);
    setMensagem(texto);
    temporizador.current = setTimeout(() => setMensagem(''), 4000);
  }, []);
  useEffect(() => () => clearTimeout(temporizador.current), []);
  return <FeedbackContext.Provider value={avisar}>
    {children}
    {!!mensagem && <View pointerEvents="none" style={{ position: 'absolute', bottom: 95, alignSelf: 'center', maxWidth: '90%', backgroundColor: paleta.petroleo, padding: 16, borderRadius: 14, zIndex: 1000 }}>
      <Text accessibilityLiveRegion="polite" style={{ color: '#FFF', fontSize: 14 }}>{mensagem}</Text>
    </View>}
  </FeedbackContext.Provider>;
}

export const useFeedback = () => useContext(FeedbackContext);
