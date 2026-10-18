# Passaporte Local

Diário pessoal de passeios, lugares e memórias pelo Brasil. Projeto de Artur Teixeira para Desenvolvimento Mobile, Sistemas de Informação, UniRios. Professor: Edemilton Alcides.

## Abrir e apresentar

**[Abrir protótipo navegável com HTTPS](https://artur-txr.github.io/passaporte-local/)**


![Capa editorial do Passaporte Local](docs/apresentacao/slides/Slide_01.png)

## Duas versões no mesmo repositório

| | Protótipo público | Base do aplicativo mobile |
|---|---|---|
| Local | `docs/` | `src/`, `assets/`, `supabase/` |
| Tecnologia | HTML, CSS e JavaScript | React Native, Expo, TypeScript, Expo Router |
| Acesso | Simulado, com dados fictícios | Código de integração com Supabase Auth |
| Persistência | IndexedDB do navegador | Serviços de visitas e fotos com Supabase |
| Fotos por visita | Até cinco, com capa | Modelo atual com um `foto_path` por visita |
| Identidade | Nova logo, três paletas | Interface mobile anterior, ainda precisa acompanhar o redesign |

O site demonstra 17 telas e estados de interface, com 13 visitas, nove cidades e 27 fotografias reais. Datas, avaliações e comentários dos exemplos são fictícios. As fotografias não representam viagens pessoais do autor.

Login no protótipo não cria uma conta real. Dados inseridos ficam neste navegador e não sincronizam com outros aparelhos. Acesso inicial ao site e downloads exigem internet. Recuperação de senha, ajuda e backup não integram a versão pública de 17 telas.

A base mobile possui seus próprios fluxos de autenticação e serviços Supabase. Sua presença no código não prova que o backend foi validado nesta revisão. As telas e o modelo de álbum do protótipo ainda precisam ser alinhados ao aplicativo final.

## Desenvolver a base mobile

Use Node.js 24 e o lockfile versionado:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Configure a URL e a chave pública do seu próprio projeto Supabase.
npm.cmd run abrir:pc
```

Outros modos: `Iniciar-Celular-WiFi.cmd`, `Iniciar-Celular.cmd` e `Iniciar-BlueStacks.cmd`. [Passo a passo completo](PASSO_A_PASSO_FACULDADE.md).

`10.0.2.2` serve para o BlueStacks. No celular físico, use a URL que o iniciador mostrar. Nenhum `.env.local`, senha, chave administrativa ou dependência instalada faz parte deste repositório.

## Verificações

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run verificar:prototipo
```

O verificador do protótipo usa apenas Node.js e confere as 17 telas, os dados demonstrativos, os arquivos de fotos, as variantes da marca e referências locais. A revisão atual está em [REVISAO_APP.md](REVISAO_APP.md).

## Planejamento

- Alinhar o mobile à identidade visual e às telas atuais.
- Planejar a migração de foto única para álbum de até cinco fotos, com ordem e capa.
- Validar autenticação, isolamento entre contas, uploads e persistência em ambiente próprio.
- Repetir os testes da versão final em celular físico.
- Confirmar cronograma, quadro Projects e entregas com o professor. As datas antigas são propostas a confirmar.

[Quadro informado do projeto](https://github.com/users/Artur-Txr/projects/1). Este quadro não foi alterado na revisão. Vídeo e envio ao AVA continuam sendo etapas separadas.

## Organização e fontes

- `docs/`: versão publicada pelo GitHub Pages, usando `main` e `/docs`.
- `docs/apresentacao/`: material acadêmico atual, com um único exemplar de cada entrega.
- `historico/`: documentação anterior preservada para consulta, sem substituir as instruções atuais.
- `supabase/migrations/`: histórico do banco mobile. Não reaplique nem apague migrações sem conferir o ambiente.
- [Créditos do protótipo](docs/CREDITOS.md) e [exemplos do mobile](assets/demonstracao/CREDITOS.md).
