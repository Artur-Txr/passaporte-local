export type Visita = {
  id: string;
  categoria: string;
  lugar: string;
  cidade: string;
  uf: string;
  data: string;
  comentario: string;
};

export const visitas: Visita[] = [
  {
    id: '1',
    categoria: 'Parque',
    lugar: 'Parque Ibirapuera',
    cidade: 'São Paulo',
    uf: 'SP',
    data: '18/10/2026',
    comentario:
      'Um passeio para caminhar, descansar e aproveitar a natureza.',
  },
  {
    id: '2',
    categoria: 'Museu',
    lugar: 'MASP',
    cidade: 'São Paulo',
    uf: 'SP',
    data: '12/10/2026',
    comentario:
      'Uma visita para conhecer obras de arte e descobrir novas histórias.',
  },
  {
    id: '3',
    categoria: 'Cafeteria',
    lugar: 'Café de exemplo',
    cidade: 'Paulo Afonso',
    uf: 'BA',
    data: '05/10/2026',
    comentario:
      'Uma pausa para tomar um café e conversar com os amigos.',
  },
];