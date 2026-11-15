import { Text as NativeText, type TextProps } from "react-native";
export default function Texto({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: "Manrope" }, style]} />;
}
