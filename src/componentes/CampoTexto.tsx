import { paleta } from "../lib/paleta";
import type { ComponentProps } from "react";
import { TextInput, View } from "react-native";
import Icone from "./Icone";
export default function CampoTexto({ icone, style, ...props }: ComponentProps<typeof TextInput> & { icone: ComponentProps<typeof Icone>["nome"] }) {
  return <View style={{ position: "relative" }}>
    <TextInput {...props} style={[style, { paddingLeft: 42, fontFamily: "Manrope", minHeight: 52 }]} />
    <View pointerEvents="none" style={{ position: "absolute", left: 10, top: 16 }}><Icone nome={icone} tamanho={19} cor={paleta.suave} /></View>
  </View>;
}
