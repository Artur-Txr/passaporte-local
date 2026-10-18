# Varredura do repositório — 18/10/2026

Base inspecionada: commit `94ab2408038ffdf23dc5f0cad28db53240faea97`, com 237 arquivos versionados. A revisão diferencia o protótipo público da base mobile existente. Nenhum banco, conta, política RLS, configuração do Supabase ou histórico Git foi apagado.

## Atualizado

- README principal com acesso HTTPS, entregas acadêmicas e distinção entre `docs/` e o aplicativo React Native.
- Apresentação editorial com nove slides principais e créditos, PPTX editável, roteiro, QR e slides 1920 × 1080 em `docs/apresentacao/`.
- Instruções de apresentação e de desenvolvimento. Removidas as afirmações de que `.env.local` e fotografias pessoais acompanham o repositório.
- Créditos da logo atual no protótipo.
- Links do painel lateral para o PDF e o roteiro publicados.
- Empacotador Windows deixou de depender de `../../work/apresentacao-licencas` da máquina de origem. Agora recebe a pasta de licenças explicitamente. O empacotamento completo não foi reexecutado.
- Comando `npm run verificar:prototipo` para conferir telas, dados e referências de arquivos sem instalar dependências.
- `.gitignore` ampliado para arquivos locais de ambiente e hospedagem.

## Removido e preservado

Removidos 26 arquivos confirmados sem referência de uso: 20 imagens do template Expo em `assets/images/`, três cartões estáticos antigos em `assets/cidades/` e três aliases `*-logo.svg` que eram cópias exatas das variantes `*-claro.svg` usadas pelo site. Lista completa em [qualidade/arquivos-removidos-2026-10-18.json](qualidade/arquivos-removidos-2026-10-18.json).

Os arquivos continuam recuperáveis no histórico Git. SVGs de origem úteis da identidade e migrações foram preservados. Os documentos anteriores foram copiados para `historico/`, com seus resultados e datas originais, e as instruções atuais ficaram na raiz.

Retirada uma variável sem uso de recuperação no protótipo. A recuperação de senha da base mobile foi mantida, pois pertence a uma implementação diferente.

## Verificação realizada

- **22 testes existentes passaram**, executados com Node.js 24 sobre a cópia do commit inspecionado.
- **TypeScript passou** na instalação local existente. Antes de executar, comparei todo o texto de `src/`, `tsconfig.json`, `package.json` e o lockfile com a cópia remota: eram equivalentes, desconsideradas apenas as quebras de linha. Nenhum arquivo TypeScript foi modificado nesta atualização.
- **153 layouts do protótipo**: 17 telas/estados × três paletas × larguras de 360, 390 e 430 px. Sem erros de execução, transbordamento horizontal ou botões para as telas removidas. [Resultado](qualidade/prototipo-153-layouts-2026-10-18.json).
- Verificador estático: 17 telas, 13 visitas, nove cidades, 27 fotos e referências locais existentes.
- Links relativos da documentação conferidos.
- PDF editorial e roteiro renderizados e revisados, QR decodificado no PDF e links do slide 7 com destino coincidente. PPTX verificado estruturalmente, sem inspeção no Microsoft PowerPoint.
- Busca por padrões conhecidos de chaves privadas e tokens: nenhum achado nos arquivos textuais inspecionados. Isso não equivale a uma auditoria completa de segurança nem verifica segredos do histórico anterior.

## Pendências reais

### Dependências mobile

`npm audit --package-lock-only --json` encontrou **30 alertas: 19 altos e 11 moderados**, sem alertas críticos. [Relatório bruto](qualidade/npm-audit-2026-10-18.json).

As sugestões do npm incluem mudanças de versão principal e até versões incompatíveis com o conjunto atual. Não foi executado `npm audit fix --force`. A atualização precisa de um ramo dedicado, revisão de compatibilidade do SDK Expo e nova validação de build e dispositivo. Esses alertas pertencem às dependências do mobile e das suas ferramentas. O site `docs/` não carrega o runtime React Native/Expo.

### Alinhamento mobile / protótipo

A base mobile ainda usa a identidade visual anterior e um `foto_path` por visita. O protótipo demonstra a nova identidade e até cinco fotos. Planejar a migração do álbum, a capa e a ordem das fotos antes de apresentar esses recursos como paridade do mobile. Não alterar ou apagar as migrações históricas para ocultar essa diferença.

Os itens de revisão mobile de 14/10 já têm correções visíveis no código, como formulário montado após a visita carregar e proteção de alterações pendentes. O relato anterior foi preservado como histórico e não tratado como lista atual de falhas confirmadas.

### Dispositivo, backend e acompanhamento

Repetir testes em celular físico da versão final. Não houve novos testes de câmera, galeria, isolamento entre contas ou gravação em Supabase nesta varredura. O usuário havia relatado testes em etapas anteriores, mas isso não substitui a validação desta revisão.

Há **17 issues abertas**, várias com datas antigas nos títulos. Não foram encerradas automaticamente. Reconciliar primeiro os critérios: por exemplo, a issue #3 inclui envio da Fase 1 e a #18 inclui vídeo, ações que não foram realizadas aqui. As datas permanecem propostas a confirmar com o professor. O quadro Projects e o AVA não foram alterados.

Os próximos passos são revisar essas issues, configurar verificação automática no GitHub Actions e trabalhar na compatibilidade das dependências em uma mudança separada.
