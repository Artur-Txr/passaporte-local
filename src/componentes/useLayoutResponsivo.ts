import { useWindowDimensions } from "react-native";
export default function useLayoutResponsivo() {
  const { width, height, fontScale } = useWindowDimensions();
  const largura = Math.min(width, 600);
  return { largura, altura: height, compacto: largura < 360 || fontScale > 1.25, margem: largura < 360 ? 12 : 20 };
}
