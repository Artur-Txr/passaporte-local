# Roteiro de apresentação
Tempo de referência: 7 minutos e 10 segundos, incluindo demonstração opcional. Acompanhe os nove slides do PDF final. O slide 7 contém link público e QR Code.

## 1 · Conceito e apresentação (30 segundos)
Cada lugar tem uma história para guardar. O Passaporte Local é um diário digital de passeios, descobertas e memórias pelo Brasil. Ele reúne o lugar, a data, as fotos e a lembrança de cada experiência, desde um café na própria cidade até uma viagem. Meu nome é Artur, e esta é a proposta da Fase 1 de Desenvolvimento Mobile, do curso de Sistemas de Informação da UniRios.

**Ação:** Apresente a ideia e avance. As fotografias são exemplos do protótipo, não um relato de viagens pessoais.

## 2 · Problema, solução e público (45 segundos)
Muitas vezes a gente tira fotos, mas depois tem dificuldade para lembrar o lugar, a data ou o que tornou aquele passeio especial. A proposta é reunir essas informações em um registro pessoal. O público inclui quem gosta de passear e conhecer lugares, mesmo sem viajar para longe. Por isso, o aplicativo contempla cafés, museus, arquitetura, centros históricos e natureza.

**Ação:** Aponte as diferentes experiências nas imagens.

## 3 · Objetivos, escopo e navegação (45 segundos)
O objetivo geral é facilitar o registro e a consulta das visitas. O usuário pode criar, consultar, editar e excluir os registros. Essas quatro operações formam o CRUD de visitas. Cadastro e login são recursos de acesso, separados desse CRUD. A navegação principal tem Início, Visitas e Perfil. A partir daí, a pessoa consulta detalhes, fotos, carimbos e cidades ou edita o perfil.

**Ação:** Percorra o fluxo visual, sem explicar cada botão.

## 4 · Entrada e consulta (40 segundos)
Na primeira tela, o aplicativo apresenta a ideia do diário. Depois do acesso demonstrativo, o início mostra o resumo da coleção e as últimas descobertas. A lista de visitas permite buscar um lugar e filtrar por cidade e categoria. A apresentação usa uma identidade editorial de viagem, com azul-petróleo, coral e fotografias reais. As telas permanecem retas para facilitar a leitura da interface.

**Ação:** Use as três capturas grandes. Não é necessário abrir o navegador.

## 5 · Registro e manutenção (50 segundos)
Para registrar uma visita, os campos obrigatórios são lugar, cidade, UF, categoria e data. As fotos, a avaliação e o comentário são opcionais. Cada registro aceita até cinco fotos, com uma escolhida como capa. Nos detalhes, o usuário consulta o álbum e a lembrança. Também pode editar o registro. A exclusão exige confirmação, porque remove a visita e suas fotos.

**Ação:** Mostre o detalhe da confirmação de exclusão e os campos do formulário.

## 6 · Passaporte e lembranças (40 segundos)
As visitas alimentam a coleção de carimbos e os contadores. Não é necessário cadastrar um carimbo separadamente. A tela da cidade agrupa os lugares registrados nela. O perfil reúne identificação e cidades da coleção, com acesso à edição do nome e do e-mail demonstrativos. A base atual contém 13 visitas de exemplo, em 9 cidades, com 27 fotografias.

**Ação:** Explique que datas, avaliações e comentários são fictícios.

## 7 · Percurso opcional de demonstração (80 segundos)
O fluxo principal começa pelo início. A pessoa abre uma visita e consulta a galeria, registra uma visita de teste, altera esse registro e depois o exclui com confirmação. Ao final, pode consultar os carimbos. Para esta apresentação, as capturas no PDF já mostram esses caminhos. A versão atual salva dados neste navegador, com acesso simulado.

**Ação:** Clique em “Abrir protótipo navegável” no slide 7 ou abra https://artur-txr.github.io/passaporte-local/. O público também pode escanear o QR Code. Consulte Museu do Amanhã e avance a foto. Crie “Visita de teste”, sua cidade e UF, categoria e data de hoje. Salve, edite o comentário, salve e exclua com confirmação. Abra Carimbos e retorne ao PDF no slide 8. Se não abrir, explique o mesmo percurso com os slides 4 a 6, sem interromper a apresentação. O site exige internet. Não altere suas visitas pessoais: use apenas o registro de teste. Se preferir apresentar só o PDF, descreva o percurso sem abrir o site.

## 8 · Planejamento técnico e dados (60 segundos)
É importante separar o que estamos demonstrando do aplicativo final. Este protótipo usa HTML, CSS e JavaScript, salva dados localmente em IndexedDB e simula o acesso. Para o aplicativo mobile, estão planejados React Native, Expo, TypeScript e Expo Router. A arquitetura prevista inclui Supabase para autenticação, banco e arquivos. No modelo proposto, um perfil tem várias visitas, e uma visita pode ter até cinco fotografias, com ordem e indicação de capa. Essa integração ainda precisa de implementação e validação.

**Ação:** Aponte perfil, visita e fotografia. Não apresente nuvem ou autenticação real como recursos deste protótipo.

## 9 · Progresso e próximos passos (40 segundos)
O protótipo reúne 17 telas e estados de interface. Já estão demonstrados o CRUD, a busca, os filtros, os álbuns e a coleção. Os próximos passos são desenvolver a versão mobile planejada, integrar o backend e validar os fluxos em celular físico. Precisamos testar teclado, áreas seguras, fotos e persistência na versão atual. O repositório do projeto também reúne a pasta do protótipo publicado no GitHub Pages. As datas antigas são propostas a confirmar.

**Ação:** Encerre agradecendo e abra espaço para perguntas. A fala termina no slide 9. A página final de créditos fica para consulta.
