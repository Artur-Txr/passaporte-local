import type { ComponentProps } from "react";
import { TextInput, View } from "react-native";
import Icone from "./Icone";
export default function CampoTexto({ icone, style, ...props }: ComponentProps<typeof TextInput> & { icone: ComponentProps<typeof Icone>["nome"] }) {
  return <View style={{ position: "relative" }}>
    <TextInput {...props} style={[style, { paddingLeft: 40 }]} />
    <View pointerEvents="none" style={{ position: "absolute", left: 10, top: 10 }}><Icone nome={icone} tamanho={19} cor="#53645B" /></View>
  </View>;
}
