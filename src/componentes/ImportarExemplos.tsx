import { useRef, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { File } from 'expo-file-system';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { useVisitas } from '../contextos/VisitasContext';
import { enviarFoto } from '../servicos/fotosService';
import { listarVisitas } from '../servicos/visitasService';
import { visual } from './Design';

const exemplos = [
  { lugar: 'Lençóis Maranhenses', cidade: 'Barreirinhas', uf: 'MA', categoria: 'Parque', foto: require('../../assets/demonstracao/lencois.jpg'), autor: 'Vitor 1234', fonte: 'https://commons.wikimedia.org/wiki/File:Lencois_Maranhenses_8.jpg', descricao: 'Dunas e lagoas no caminho da Lagoa Bonita.' },
  { lugar: 'Praia do Sancho', cidade: 'Fernando de Noronha', uf: 'PE', categoria: 'Outro', foto: require('../../assets/demonstracao/noronha.jpg'), autor: 'Marina Feldhues', fonte: 'https://commons.wikimedia.org/wiki/File:Praia_do_Sancho,_Fernando_de_Noronha.jpg', descricao: 'Mar e falésias de Fernando de Noronha.' },
  { lugar: 'Cataratas do Iguaçu', cidade: 'Foz do Iguaçu', uf: 'PR', categoria: 'Parque', foto: require('../../assets/demonstracao/iguacu.jpg'), autor: 'Marcio Fernandes de Lima', fonte: 'https://commons.wikimedia.org/wiki/File:Iguazu_Falls_Foz_do_Iguaçu_PR_Brazil.JPG', descricao: 'Vista das quedas a partir da trilha brasileira.' },
];

export default function ImportarExemplos() {
  const { sessao } = useAutenticacao();
  const { adicionarVisita, carregando, erro } = useVisitas();
  const trava = useRef(false);
  const fotosEnviadas = useRef(new Map<string, string>());
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function importar() {
    const usuarioId = sessao?.user.id;
    if (!usuarioId || trava.current || carregando || erro) return;
    trava.current = true;
    setOcupado(true);
    let criadas = 0;
    try {
      const existentes = await listarVisitas(usuarioId);
      for (const exemplo of exemplos) {
        const lugar = `DEMONSTRAÇÃO — ${exemplo.lugar}`;
        if (existentes.some(v => v.lugar === lugar)) continue;
        setMensagem(`Importando ${exemplo.lugar}…`);
        const chave = `${usuarioId}/${exemplo.lugar}`;
        let foto_path = fotosEnviadas.current.get(chave);
        if (!foto_path) {
          const uri = Image.resolveAssetSource(exemplo.foto).uri;
          let conteudo: ArrayBuffer;
          if (Platform.OS !== 'web' && uri.startsWith('file:')) {
            conteudo = await new File(uri).arrayBuffer();
          } else {
            const resposta = await fetch(uri);
            if (!resposta.ok) throw new Error('Falha ao carregar fotografia.');
            conteudo = await resposta.arrayBuffer();
          }
          foto_path = await enviarFoto(usuarioId, conteudo, 'image/jpeg');
          fotosEnviadas.current.set(chave, foto_path);
        }
        await adicionarVisita({ lugar, cidade: exemplo.cidade, uf: exemplo.uf,
          categoria: exemplo.categoria, data: '13/10/2026', avaliacao: null, foto_path,
          comentario: `EXEMPLO PARA APRESENTAÇÃO. Data fictícia: 13/10/2026. Não representa uma viagem do usuário.\n${exemplo.descricao}\nFoto: ${exemplo.autor} / Wikimedia Commons. Licença CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/\nFonte: ${exemplo.fonte}\nFotografia sem edição local; Noronha usa a versão de 1920 px fornecida pela Wikimedia.` });
        criadas++;
      }
      setMensagem(criadas ? `${criadas} exemplos adicionados com fotos e créditos.` : 'Os três exemplos já estão na sua coleção.');
    } catch {
      setMensagem(`${criadas} exemplos adicionados. Não foi possível concluir; confira a conexão e tente novamente. Os registros existentes serão preservados.`);
    } finally { trava.current = false; setOcupado(false); }
  }

  return <View style={{ marginTop: 20, gap: 8 }}>
    <Text style={visual.subtitle}>Exemplos para apresentação: três lugares do Brasil com fotos reais. Datas fictícias e créditos identificados nos detalhes.</Text>
    <Pressable accessibilityRole="button" disabled={ocupado || carregando || !!erro} onPress={importar} style={[visual.button, { opacity: ocupado ? 0.6 : 1 }]}>
      <Text style={visual.buttonText}>{ocupado ? 'Importando…' : 'Adicionar exemplos do Brasil'}</Text>
    </Pressable>
    {!!mensagem && <Text accessibilityLiveRegion="polite" style={visual.subtitle}>{mensagem}</Text>}
  </View>;
}
