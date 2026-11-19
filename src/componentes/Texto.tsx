import { StyleSheet, Text as NativeText, type TextProps } from "react-native";

const familias: Record<string, string> = {
  "600": "Manrope-SemiBold",
  "700": "Manrope-Bold",
  bold: "Manrope-Bold",
  "800": "Manrope-ExtraBold",
};

export default function Texto({ style, ...props }: TextProps) {
  const { fontFamily, fontWeight } = StyleSheet.flatten(style) ?? {};
  const familia = familias[String(fontWeight)];
  return <NativeText {...props} style={[{ fontFamily: "Manrope" }, style,
    !fontFamily && familia ? { fontFamily: familia, fontWeight: "normal" } : undefined]} />;
}
