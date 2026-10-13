const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export function formatarDataVisita(data: string, extensa = false) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!partes) return data;
  const [, dia, mes, ano] = partes;
  const indice = Number(mes) - 1;
  if (!meses[indice]) return data;
  return extensa ? `${Number(dia)} de ${meses[indice]} de ${ano}` : `${dia} ${meses[indice].slice(0, 3)} ${ano}`;
}

export function formatarEntradaData(texto: string) {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}
