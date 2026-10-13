export type Traco = [number, number, number, number, 'bloco' | 'oval' | 'montanha' | 'linha', number?];
export type IdentidadeCarimbo = { nome: string; tema: string; cor: string; raio: number; desenho: Traco[] };
const b = (x:number,y:number,w:number,h:number):Traco => [x,y,w,h,'bloco'];
const o = (x:number,y:number,w:number,h:number):Traco => [x,y,w,h,'oval'];
const m = (x:number,y:number,w:number,h:number):Traco => [x,y,w,h,'montanha'];
const l = (x:number,y:number,w:number,r=0):Traco => [x,y,w,2,'linha',r];
export const carimbosUF: Record<string, IdentidadeCarimbo> = {
 AC: { nome:'Acre',tema:'Seringueiras',cor:'#47755E',raio:90,desenho:[b(24,20,4,35),o(7,4,36,28),b(71,18,4,37),o(54,0,40,31),l(5,55,92)] },
 AL: { nome:'Alagoas',tema:'Coqueiros e mar',cor:'#367C83',raio:38,desenho:[l(0,47,100),l(8,54,85),b(69,13,3,32),l(52,13,34,-20),l(57,8,25,25),o(8,3,15,15)] },
 AP: { nome:'Amapá',tema:'Marco do Equador',cor:'#686D45',raio:90,desenho:[b(46,3,9,45),b(35,47,30,5),o(37,14,26,26),l(0,54,102)] },
 AM: { nome:'Amazonas',tema:'Rio e floresta',cor:'#35695C',raio:32,desenho:[o(0,7,22,26),o(22,1,26,33),o(51,6,24,27),o(77,0,24,34),l(4,43,43,-9),l(47,45,44,8),l(8,54,89)] },
 BA: { nome:'Bahia',tema:'Casario colonial',cor:'#9A6044',raio:90,desenho:[b(4,20,20,33),m(3,11,22,10),b(27,11,21,42),m(26,1,23,11),b(51,22,22,31),m(50,12,24,11),b(77,15,20,38),m(76,5,22,11)] },
 CE: { nome:'Ceará',tema:'Jangada',cor:'#A0753F',raio:38,desenho:[l(16,49,75),b(45,2,3,46),m(48,5,39,37),l(7,55,88),o(4,3,13,13)] },
 DF: { nome:'Distrito Federal',tema:'Brasília',cor:'#596D88',raio:90,desenho:[b(45,6,7,46),b(57,6,7,46),o(7,35,30,13),o(72,32,29,16),l(0,54,104)] },
 ES: { nome:'Espírito Santo',tema:'Convento na colina',cor:'#76814E',raio:34,desenho:[m(2,20,98,34),b(38,7,28,22),b(42,0,7,9),m(37,0,30,8),l(0,55,104)] },
 GO: { nome:'Goiás',tema:'Cerrado',cor:'#92723D',raio:90,desenho:[l(44,23,5,25),b(45,24,4,30),o(15,5,60,23),l(4,55,96),m(77,34,24,20)] },
 MA: { nome:'Maranhão',tema:'Dunas e lagoas',cor:'#797B4C',raio:38,desenho:[m(0,19,59,26),m(41,8,63,29),l(19,48,58),l(3,53,99)] },
 MT: { nome:'Mato Grosso',tema:'Chapadas',cor:'#8D654B',raio:90,desenho:[b(5,12,28,40),b(37,3,34,49),b(76,21,24,31),l(0,55,104)] },
 MS: { nome:'Mato Grosso do Sul',tema:'Pantanal',cor:'#477F76',raio:36,desenho:[l(0,48,102),o(51,7,28,17),l(65,24,23,75),l(72,27,20,90),m(71,8,18,7),l(9,52,27),b(17,9,3,34)] },
 MG: { nome:'Minas Gerais',tema:'Igrejas e montanhas',cor:'#80654B',raio:90,desenho:[m(0,24,44,28),m(62,28,41,24),b(32,15,38,37),b(28,4,8,48),b(67,4,8,48),m(40,8,21,10),l(0,55,104)] },
 PA: { nome:'Pará',tema:'Mercado e rios',cor:'#587A5C',raio:34,desenho:[b(10,27,82,25),m(8,14,86,15),b(12,10,5,20),b(85,10,5,20),m(8,0,13,11),m(81,0,13,11),l(0,55,104)] },
 PB: { nome:'Paraíba',tema:'Farol e litoral',cor:'#407A8C',raio:90,desenho:[b(46,18,13,33),b(41,12,23,7),o(45,1,15,11),m(27,45,52,10),l(0,55,104)] },
 PR: { nome:'Paraná',tema:'Cataratas',cor:'#466C57',raio:38,desenho:[b(0,9,104,6),b(5,15,7,30),b(22,15,5,40),b(38,15,9,33),b(56,15,5,39),b(72,15,8,27),b(91,15,6,35),l(0,55,104)] },
 PE: { nome:'Pernambuco',tema:'Arquipélago',cor:'#3F7A82',raio:90,desenho:[o(13,7,28,40),o(48,18,24,29),m(72,24,31,23),l(0,49,104),l(4,55,92),o(82,0,12,12)] },
 PI: { nome:'Piauí',tema:'Serra e arqueologia',cor:'#9A6B43',raio:36,desenho:[m(0,9,49,44),m(43,4,61,49),o(39,19,10,10),l(44,29,18,75),l(31,33,25),l(38,44,18,-30),l(45,44,18,30)] },
 RJ: { nome:'Rio de Janeiro',tema:'Montanhas da baía',cor:'#557D89',raio:90,desenho:[o(1,16,38,37),o(46,1,28,53),o(76,24,25,29),l(0,55,104),o(9,0,12,12)] },
 RN: { nome:'Rio Grande do Norte',tema:'Dunas e sol',cor:'#A07A45',raio:34,desenho:[o(63,0,22,22),m(0,29,57,26),m(44,22,60,33),l(4,55,94)] },
 RS: { nome:'Rio Grande do Sul',tema:'Araucária e campos',cor:'#6F7050',raio:90,desenho:[b(47,12,4,42),l(20,9,58),l(27,19,44),l(33,29,32),o(0,44,104,11)] },
 RO: { nome:'Rondônia',tema:'Ferrovia',cor:'#7E6956',raio:36,desenho:[b(14,20,47,24),b(64,9,20,35),b(22,8,8,12),o(18,40,15,15),o(49,40,15,15),o(72,40,15,15),l(0,55,104)] },
 RR: { nome:'Roraima',tema:'Monte Roraima',cor:'#666F84',raio:90,desenho:[b(24,4,59,20),m(1,23,100,32),b(19,15,68,10),l(0,55,104)] },
 SC: { nome:'Santa Catarina',tema:'Ponte e litoral',cor:'#4D7C88',raio:34,desenho:[b(18,7,4,44),b(81,7,4,44),l(1,35,102),l(20,9,65),l(0,24,22,-32),l(82,23,22,32),l(0,55,104)] },
 SP: { nome:'São Paulo',tema:'Horizonte urbano',cor:'#6E7181',raio:90,desenho:[b(4,27,15,27),b(23,13,14,41),b(43,1,13,53),b(61,20,15,34),b(80,9,17,45),l(0,55,104)] },
 SE: { nome:'Sergipe',tema:'Cânion do São Francisco',cor:'#98634D',raio:36,desenho:[b(0,4,28,48),b(76,0,28,52),m(18,25,22,27),m(63,20,27,32),l(39,48,23),l(33,55,37)] },
 TO: { nome:'Tocantins',tema:'Jalapão',cor:'#A07B40',raio:90,desenho:[m(0,23,62,32),m(41,12,63,43),o(10,0,16,16),b(83,30,3,24),l(72,30,24,-20),l(77,27,18,30)] },
};
export function identidadeCarimbo(uf: string) {
  return carimbosUF[uf.trim().toUpperCase()] ?? { nome:'Brasil',tema:'Descoberta',cor:'#687958',raio:90,desenho:[m(4,12,60,43),o(74,3,18,18),l(0,55,104)] as Traco[] };
}
