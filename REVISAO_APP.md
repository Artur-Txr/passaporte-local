# Revisão do Passaporte Local — 14/10/2026

Revisão estática dos fluxos de apresentação, cadastro/login, recuperação, início, lista, nova visita, edição, detalhes, passaporte, perfil e serviços de fotos/visitas. Nesta revisão não houve inspeção visual em novos dispositivos nem alteração do banco. SMTP adiado por decisão do usuário.

## Verificação executada

- `npm.cmd test`: 12 testes passaram.
- `npm.cmd run typecheck`: passou.
- Os testes existentes cobrem datas, limite de tamanho, códigos de UF e validações de recuperação. Não cobrem os ciclos de tela abaixo.
- O usuário já confirmou no Android: câmera, galeria, salvar/reabrir com foto, edição, exclusão, busca/filtros e sessão persistente.

## Prioridade alta

1. **Edição antes de terminar a consulta** — `src/app/editar-visita.tsx`: os campos são inicializados com `useState(visita?.campo ?? '')`. Se a rota abrir antes de as visitas chegarem, o formulário permanece vazio mesmo quando o registro aparecer. Separar o carregamento do formulário e montá-lo somente quando a visita for encontrada; preservar mudanças do usuário durante atualizações posteriores. Reproduzir abrindo diretamente a rota e recarregando com a consulta atrasada.
2. **Proteção de alterações não salvas** — nova visita e edição não têm bloqueio de saída por alterações pendentes. Voltar pode descartar textos e foto selecionada sem confirmação; durante envio, sair também merece proteção. Incluir confirmação tanto no botão do cabeçalho quanto no voltar do Android, sem bloquear a saída após salvar com sucesso.
3. **Carregamento, erro e vazio distintos** — passaporte lê apenas visitas e pode apresentar coleção vazia enquanto carrega ou após falha inicial. Detalhes e edição podem apresentar registro não encontrado antes da consulta terminar. Oferecer indicador, mensagem de erro com tentativa e estado vazio somente após consulta concluída.

## Prioridade média

4. **Fotos após falha ou expiração** — MiniFoto em `Design.tsx` ignora erro da assinatura e troca falha da imagem pelo mesmo marcador de visita sem foto. Não renova URLs enquanto caminho/usuário forem iguais; assinatura dura uma hora. Atualizar a lista não necessariamente renova miniaturas já montadas. Distinguir ausência de foto de falha e permitir nova tentativa/renovação ao retornar ao app.
5. **Arquivos sem visita associada** — nova visita e edição enviam a foto antes de salvar o registro. Há reaproveitamento na repetição da mesma tentativa, mas sair após falha ou escolher outra imagem pode deixar arquivo sem referência. Definir limpeza de uploads temporários sem remover arquivos de operações que possam ter sido confirmadas pelo servidor após uma falha de rede.
6. **Erros no navegador e tradução** — login/cadastro usam Alert.alert para validação/erros; validar apresentação na web e adotar mensagens visíveis no formulário. Alguns erros do serviço são exibidos em inglês. Traduzir por código e manter detalhes técnicos fora do texto para o usuário.
7. **Cidades e ordenação consistentes** — busca normaliza acentos, mas os totais de início/perfil não usam a mesma normalização. São Paulo e Sao Paulo podem contar separadamente. Definir uma função compartilhada de identidade cidade/UF. A lista ordena por criação do registro; definir se Últimos carimbos deve seguir cadastro ou data da visita e comunicar a escolha.

## Entrega e validações restantes

- `app.json` não define ícone próprio ou adaptive icon. Preparar identidade para uma futura instalação; o uso pelo Expo Go não comprova o ícone de um APK.
- Conferir visualmente larguras pequenas, fonte ampliada, teclado aberto e nomes longos. Código responsivo existente não substitui essa conferência.
- Testar isolamento entre duas contas e perda/retorno de conexão; não estão comprovados pelos testes de uma única conta.
- Testar envio real de imagem acima de 5 MB e próxima de 20 MB, observando tempo e memória.
- Recuperação completa de senha permanece pendente: o envio real retornou limite de e-mails e o link recebido foi recusado. SMTP fica adiado.
- Atualizar ZIP e publicar os commits locais antes da entrega. O script Wi-Fi atual fixa o IP deste computador e precisa ser portável para outra rede.

Ordem sugerida: inicialização da edição e estados de consulta; proteção contra perda de alterações; recuperação das fotos; acabamento visual e pacote de entrega.


## Implementação após a revisão

- Edição separada em carregamento e formulário, montado por id somente após encontrar a visita. Atualizações posteriores não sobrescrevem o preenchimento em andamento.
- Confirmação de descarte nos formulários, bloqueio de saída durante operação, proteção no voltar Android e aviso ao fechar/recarregar a página web. Salvar com sucesso libera a saída. Fechar forçadamente o processo nativo não mantém um rascunho.
- Detalhes, edição e passaporte distinguem carregamento, erro e registro ausente; passaporte permite atualizar puxando para baixo.
- Fotos e miniaturas compartilham tratamento de falha, nova tentativa e renovação ao retornar ao app, a cada 50 minutos e ao atualizar a lista.
- Diário local por usuário registra uploads pendentes. Ao montar a sessão, uploads registrados há mais de 24 horas são consultados: arquivos vinculados são preservados; somente arquivos sem referência podem ser removidos. Falha de consulta preserva o arquivo. O mecanismo não limpa arquivos antigos anteriores à implementação nem funciona se o diário local for apagado.
- Login/cadastro exibem feedback também no navegador e traduzem erros por código. Normalização compartilhada de cidade/UF evita duplicação por acentos/espaços; início identifica explicitamente carimbos por ordem de cadastro.
- Ícones de instalação e favicon configurados com a logo original dentro de composição SVG quadrada. A aparência final na máscara do launcher depende de um build instalado.
- Iniciador Wi-Fi detecta a interface local, evitando IP fixo e interfaces virtuais conhecidas. Guia da faculdade atualizado.

### Evidência e limites desta implementação

15 testes automatizados passaram, incluindo cidades, mensagens de autenticação e elegibilidade segura de uploads. TypeScript e exportação web passaram. O navegador integrado não alcançou os servidores locais de conferência; portanto não foi possível confirmar visualmente as novas telas em múltiplas dimensões neste ambiente. Os testes anteriores do usuário em Android continuam registrados separadamente em ROTEIRO_TESTES.md.

Continuam como validações físicas: confirmação de descarte no Android, múltiplas telas/fonte ampliada, falha e retorno de rede, upload real perto de 20 MB e isolamento com duas contas autenticadas. Não foram criadas contas nem alteradas senhas para simular esses testes. SMTP e recuperação por e-mail permanecem adiados pelo usuário.

Exportação Android com bytecode Hermes também passou. A primeira tentativa foi bloqueada na pasta temporária do sandbox; repetida com TEMP/TMP em work/build-temp, concluiu com sucesso. Isso valida o empacotamento JavaScript, não equivale a gerar ou instalar um APK.
