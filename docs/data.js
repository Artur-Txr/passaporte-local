// Registros demonstrativos; fotos reais e dados de visita fictícios.
const initialVisits=[
  {
    "id": 1,
    "name": "Museu do Amanhã",
    "city": "Rio de Janeiro",
    "uf": "RJ",
    "category": "Museu",
    "date": "2026-10-10",
    "photo": "assets/museu-amanha.jpg",
    "rating": 5,
    "comment": "Arquitetura, ideias e uma tarde para olhar o mundo de outro jeito.",
    "approx": false,
    "photos": [
      "assets/museu-amanha.jpg",
      "assets/amanha-2.jpg",
      "assets/amanha-3.jpg",
      "assets/amanha-4.jpg",
      "assets/amanha-5.jpg"
    ]
  },
  {
    "id": 2,
    "name": "Confeitaria Colombo",
    "city": "Rio de Janeiro",
    "uf": "RJ",
    "category": "Cafeteria",
    "date": "2026-10-08",
    "photo": "assets/colombo.jpg",
    "rating": 4,
    "comment": "Um café entre espelhos, vitrais e histórias. Uma pausa que virou lembrança.",
    "approx": false,
    "photos": [
      "assets/colombo.jpg",
      "assets/colombo-2.jpg"
    ]
  },
  {
    "id": 3,
    "name": "Pelourinho",
    "city": "Salvador",
    "uf": "BA",
    "category": "Centro histórico",
    "date": "2026-10-05",
    "photo": "assets/pelourinho.jpg",
    "rating": 5,
    "comment": "Cores, fachadas e um passeio sem pressa pelo centro histórico.",
    "approx": false,
    "photos": [
      "assets/pelourinho.jpg",
      "assets/pelourinho-2.jpg"
    ]
  },
  {
    "id": 4,
    "name": "Museu Oscar Niemeyer",
    "city": "Curitiba",
    "uf": "PR",
    "category": "Museu",
    "date": "2026-09-24",
    "photo": "assets/oscar.jpg",
    "rating": 5,
    "comment": "Um encontro com a arte, dentro e fora do museu.",
    "approx": false,
    "photos": [
      "assets/oscar.jpg",
      "assets/oscar-2.jpg"
    ]
  },
  {
    "id": 5,
    "name": "Lençóis Maranhenses",
    "city": "Barreirinhas",
    "uf": "MA",
    "category": "Natureza",
    "date": "2026-09-12",
    "photo": "assets/lencois.jpg",
    "rating": 5,
    "comment": "Dunas claras e lagoas azuis para guardar na memória.",
    "approx": false,
    "photos": [
      "assets/lencois.jpg",
      "assets/lencois-2.jpg"
    ]
  },
  {
    "id": 6,
    "name": "Cachoeira Santa Bárbara",
    "city": "Cavalcante",
    "uf": "GO",
    "category": "Cachoeira",
    "date": "2026-08-29",
    "photo": "assets/santa-barbara.jpg",
    "photos": [
      "assets/santa-barbara.jpg",
      "assets/santa-barbara-2.jpg"
    ],
    "rating": 5,
    "comment": "A água transparente e o som da queda fizeram o dia desacelerar.",
    "approx": false
  },
  {
    "id": 7,
    "name": "Trilha da Pedra Bonita",
    "city": "Rio de Janeiro",
    "uf": "RJ",
    "category": "Trilha",
    "date": "2026-08-18",
    "photo": "assets/pedra-bonita.jpg",
    "photos": [
      "assets/pedra-bonita.jpg",
      "assets/pedra-bonita-2.jpg"
    ],
    "rating": 4,
    "comment": "O caminho pela mata terminou com uma vista que valeu cada passo.",
    "approx": false
  },
  {
    "id": 8,
    "name": "Cataratas do Iguaçu",
    "city": "Foz do Iguaçu",
    "uf": "PR",
    "category": "Cachoeira",
    "date": "2026-07-24",
    "photo": "assets/iguacu.jpg",
    "photos": [
      "assets/iguacu.jpg",
      "assets/iguacu-2.jpg"
    ],
    "rating": 5,
    "comment": "A força das águas e a névoa no rosto ficaram na memória.",
    "approx": false
  },
  {
    "id": 9,
    "name": "Praia do Sancho",
    "city": "Fernando de Noronha",
    "uf": "PE",
    "category": "Praia",
    "date": "2026-07-12",
    "photo": "assets/sancho.jpg",
    "photos": [
      "assets/sancho.jpg",
      "assets/sancho-2.jpg"
    ],
    "rating": 5,
    "comment": "Uma pausa diante do mar, com tons de azul por todos os lados.",
    "approx": false
  },
  {
    "id": 10,
    "name": "Parque Ibirapuera",
    "city": "São Paulo",
    "uf": "SP",
    "category": "Parque",
    "date": "2026-06-20",
    "photo": "assets/ibirapuera.jpg",
    "photos": [
      "assets/ibirapuera.jpg",
      "assets/ibirapuera-2.jpg"
    ],
    "rating": 5,
    "comment": "Uma caminhada entre o lago, as árvores e a vida da cidade.",
    "approx": false
  },
  {
    "id": 11,
    "name": "Teatro Amazonas",
    "city": "Manaus",
    "uf": "AM",
    "category": "Cultura",
    "date": "2026-06-10",
    "photo": "assets/amazonas.jpg",
    "photos": [
      "assets/amazonas.jpg",
      "assets/amazonas-2.jpg"
    ],
    "rating": 5,
    "comment": "A cúpula, a plateia e os detalhes do teatro transformaram a visita em uma viagem pela história.",
    "approx": false
  },
  {
    "id": 12,
    "name": "Café Girondino",
    "city": "São Paulo",
    "uf": "SP",
    "category": "Cafeteria",
    "date": "2026-05-30",
    "photo": "assets/girondino.jpg",
    "photos": [
      "assets/girondino.jpg"
    ],
    "rating": 4,
    "comment": "Uma pausa para café no centro, com a cidade acontecendo ao redor.",
    "approx": false
  },
  {
    "id": 13,
    "name": "Edifício Copan",
    "city": "São Paulo",
    "uf": "SP",
    "category": "Arquitetura",
    "date": "2026-05-28",
    "photo": "assets/copan.jpg",
    "photos": [
      "assets/copan.jpg"
    ],
    "rating": 5,
    "comment": "As curvas da fachada mudam a forma de olhar a paisagem urbana.",
    "approx": false
  }
];