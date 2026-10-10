import { Text } from "react-native";
const glifos = {
  inicio: "\ue88a",
  lugar: "\ue0c8",
  perfil: "\ue7fd",
  camera: "\ue3b0",
  excluir: "\ue872",
  calendario: "\ue916",
  cidade: "\ue7f1",
  mundo: "\ue80b",
};
export default function Icone({
  nome,
  tamanho = 24,
  cor = "#123E34",
}: {
  nome: keyof typeof glifos;
  tamanho?: number;
  cor?: string;
}) {
  return (
    <Text
      accessible={false}
      style={{
        fontFamily: "Simbolos",
        fontSize: tamanho,
        color: cor,
        lineHeight: tamanho + 4,
      }}
    >
      {glifos[nome]}
    </Text>
  );
}
