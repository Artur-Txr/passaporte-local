export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function chaveCidade(cidade: string, uf: string): string {
  return `${normalizarTexto(cidade)}|${uf.trim().toUpperCase()}`;
}
