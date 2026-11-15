import { interpretarLugares, type LugarEncontrado } from '../lib/mapa';

const cache = new Map<string, { quando: number; lugares: LugarEncontrado[] }>();

export async function buscarLugares(termo: string): Promise<LugarEncontrado[]> {
  const busca = termo.trim().slice(0, 160);
  if (busca.length < 3) throw new Error('Digite pelo menos 3 caracteres para buscar.');
  const chave = busca.toLocaleLowerCase('pt-BR');
  const salvo = cache.get(chave);
  if (salvo && Date.now() - salvo.quando < 10 * 60 * 1000) return salvo.lugares;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 15000);
  try {
    const resposta = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(busca)}&limit=5`, { signal: controle.signal });
    if (!resposta.ok) throw new Error('Busca indisponível. Tente novamente em instantes.');
    const dados: unknown = await resposta.json();
    if (!dados || typeof dados !== 'object' || !('features' in dados) || !Array.isArray(dados.features)) throw new Error('Resposta inválida da busca.');
    const lugares = interpretarLugares(dados);
    if (cache.size >= 30) cache.delete(cache.keys().next().value!);
    cache.set(chave, { quando: Date.now(), lugares });
    return lugares;
  } finally { clearTimeout(timer); }
}
