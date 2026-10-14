import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { uploadPodeSerRevisado, type UploadPendente } from '../lib/uploadsPendentes';

const chave = (usuarioId: string) => `passaporte:uploads-pendentes:${usuarioId}`;
async function ler(usuarioId: string): Promise<UploadPendente[]> {
  const valor = await AsyncStorage.getItem(chave(usuarioId));
  const dados: unknown = valor ? JSON.parse(valor) : [];
  if (!Array.isArray(dados)) return [];
  return dados.filter((item): item is UploadPendente => !!item && typeof item.caminho === 'string' && typeof item.criadoEm === 'number');
}

// Falha do diário nunca transforma um cadastro confirmado em falha de gravação.
export async function registrarUpload(usuarioId: string, caminho: string) {
  try {
    const lista = await ler(usuarioId);
    await AsyncStorage.setItem(chave(usuarioId), JSON.stringify([...lista.filter(i => i.caminho !== caminho), { caminho, criadoEm: Date.now() }]));
  } catch { /* Preservar arquivo se o dispositivo não conseguir registrar o diário. */ }
}

export async function confirmarUpload(usuarioId: string, caminho: string) {
  try {
    const lista = await ler(usuarioId);
    await AsyncStorage.setItem(chave(usuarioId), JSON.stringify(lista.filter(i => i.caminho !== caminho)));
  } catch { /* Uma futura conferência de referências também preserva a foto salva. */ }
}

// Executado somente ao montar a sessão, nunca enquanto um formulário está salvando.
// Arquivos recentes e resultados de rede incertos são preservados.
export async function revisarUploadsAntigos(usuarioId: string) {
  try {
    const lista = await ler(usuarioId);
    for (const upload of lista.filter(i => uploadPodeSerRevisado(i, usuarioId, Date.now())).slice(0, 20)) {
      const { data: sessao } = await supabase.auth.getSession();
      if (sessao.session?.user.id !== usuarioId) return;
      const { data, error } = await supabase.from('visitas').select('id').eq('usuario_id', usuarioId).eq('foto_path', upload.caminho).limit(1);
      if (error || !data) continue;
      if (!data.length) {
        const { error: falha } = await supabase.storage.from('fotos-visitas').remove([upload.caminho]);
        if (falha) continue;
      }
      await confirmarUpload(usuarioId, upload.caminho);
    }
  } catch { /* Sem conexão ou diário indisponível: tentar em outra abertura da sessão. */ }
}
