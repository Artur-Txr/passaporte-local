import { useEffect, useRef, useState } from 'react';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { router } from 'expo-router';
import { Alert, BackHandler, Platform } from 'react-native';

export default function useProtegerFormulario(alterado: boolean, ocupado: boolean) {
  const navigation = useNavigation();
  const salvo = useRef(false);
  const [saida, setSaida] = useState<(() => void) | null>(null);
  const [liberado, setLiberado] = useState(false);
  usePreventRemove(!liberado && (alterado || ocupado), ({ data }) => {
    if (salvo.current) { navigation.dispatch(data.action); return; }
    if (ocupado) {
      if (Platform.OS !== 'web') Alert.alert('Aguarde', 'Conclua a operação antes de sair.');
      return;
    }
    const descartar = () => navigation.dispatch(data.action);
    if (Platform.OS === 'web') {
      if (window.confirm('Descartar as alterações não salvas?')) descartar();
    } else Alert.alert('Descartar alterações?', 'Os campos e a foto ainda não foram salvos.', [
      { text: 'Continuar editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: descartar },
    ]);
  });
  useEffect(() => {
    if (Platform.OS !== 'android' || liberado || (!alterado && !ocupado)) return;
    const evento = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigation.isFocused() || navigation.canGoBack()) return false;
      router.replace('/inicio');
      return true;
    });
    return () => evento.remove();
  }, [alterado, ocupado, liberado, navigation]);
  useEffect(() => {
    if (Platform.OS !== 'web' || liberado || (!alterado && !ocupado)) return;
    const proteger = (evento: BeforeUnloadEvent) => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', proteger);
    return () => window.removeEventListener('beforeunload', proteger);
  }, [alterado, ocupado, liberado]);
  useEffect(() => { if (liberado && saida) saida(); }, [liberado, saida]);
  return (continuar: () => void) => {
    salvo.current = true;
    setSaida(() => continuar);
    setLiberado(true);
  };
}
