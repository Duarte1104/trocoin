export type TipoProposta = 'compra' | 'troca';

export type EstadoProposta =
  | 'pendente'
  | 'aceite'
  | 'recusada'
  | 'paga'
  | 'concluida';

export interface Proposta {
  id: number;

  conversaId: number;
  anuncioId: number;

  compradorId: number;
  vendedorId: number;

  tipo: TipoProposta;

  valorProposto?: number;

  anuncioTrocaId?: number;
  tituloAnuncioTroca?: string;
  valorExtraOferecido?: number;

  mensagem?: string;

  estado: EstadoProposta;

  dataCriacao: string;
  dataAtualizacao: string;
}