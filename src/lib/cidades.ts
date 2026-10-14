import type { Visita } from '../dados/visitas';

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function chaveCidade(cidade: string, uf: string): string {
  return `${normalizarTexto(localizacaoVisita(cidade, uf).cidade)}|${uf.trim().toUpperCase()}`;
}

// Fonte: Prefeitura de Paulo Afonso, "Secretário Municipal de Turismo visita sítios
// com pinturas rupestres no Rio do Sal". Esta apresentação não altera o cadastro.
export function localizacaoVisita(cidade: string, uf: string): { cidade: string; localidade: string | null } {
  const nome = normalizarTexto(cidade).replace(/^povoado\s+/, '');
  if (uf.trim().toUpperCase() === 'BA' && ['rio do sal', 'rio de sal'].includes(nome)) {
    return { cidade: 'Paulo Afonso', localidade: cidade.trim() };
  }
  return { cidade: cidade.trim(), localidade: null };
}

export function rotuloCidade(cidade: string, uf: string): string {
  return `${localizacaoVisita(cidade, uf).cidade} · ${uf.trim().toUpperCase()}`;
}
export function agruparCidades(visitas: readonly Visita[]) {
  const grupos = new Map<string, { chave: string; nome: string; visita: Visita; quantidade: number; localidades: string[] }>();
  for (const visita of visitas) {
    const chave = chaveCidade(visita.cidade, visita.uf);
    const local = localizacaoVisita(visita.cidade, visita.uf);
    const grupo = grupos.get(chave) ?? { chave, nome: rotuloCidade(visita.cidade, visita.uf), visita, quantidade: 0, localidades: [] };
    grupo.quantidade++;
    if (!grupo.visita.foto_path && visita.foto_path) grupo.visita = visita;
    if (local.localidade && !grupo.localidades.includes(local.localidade)) grupo.localidades.push(local.localidade);
    grupos.set(chave, grupo);
  }
  return Array.from(grupos.values());
}
