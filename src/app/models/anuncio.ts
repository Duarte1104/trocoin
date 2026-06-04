export type TipoAnuncio = 'venda' | 'troca';

export type EstadoAnuncio =
  | 'ativo'
  | 'reservado'
  | 'vendido'
  | 'trocado'
  | 'inativo';

export interface Anuncio {
  id: number;
  moedaId: number;

  titulo: string;
  descricao: string;
  preco: number;

  tipo: TipoAnuncio;
  estadoConservacao: string;
  localizacao: string;

  vendedorId: number;
  compradorId?: number;

  imagens: string[];

  favorito?: boolean;
  publicadoPeloUtilizador?: boolean;

  estadoAnuncio?: EstadoAnuncio;

  precoFinal?: number;
  dataPublicacao: string;
  dataConclusao?: string;

  ano?: number;
}