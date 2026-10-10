export const categorias = ['Parque', 'Museu', 'Cafeteria', 'Outro'];
export const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
  'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
  'RR', 'SC', 'SP', 'SE', 'TO',
];

export function dataValida(texto: string, hoje = new Date()): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return false;
  const [dia, mes, ano] = texto.split('/').map(Number);
  if (ano < 1900) return false;
  const data = new Date(ano, mes - 1, dia);
  const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return data.getFullYear() === ano && data.getMonth() === mes - 1 &&
    data.getDate() === dia && data <= limite;
}
