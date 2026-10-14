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
  email: "\ue0e1",
  aviao: "\ue539",
  busca: "\ue8b6",
  natureza: "\uea35",
  museu: "\ue84f",
  cafe: "\ue541",
  editar: "\ue3c9",
  voltar: "\ue5cb",
  senha: "\ue897",
  olho: "\ue8f4",
  olhoFechado: "\ue8f5",
  expandir: "\ue5cf",
  proximo: "\ue5cc",
  atualizar: "\ue5d5",
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
        includeFontPadding: false,
        textAlign: "center",
        minWidth: tamanho + 4,
        flexShrink: 0,
      }}
    >
      {glifos[nome]}
    </Text>
  );
}
