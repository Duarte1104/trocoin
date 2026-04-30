export interface Anuncio {
  id: number;
  moedaId: number;
  titulo: string;
  descricao: string;
  preco: number;
  tipo: 'venda' | 'troca' | 'venda-troca';
  estadoConservacao: string;
  localizacao: string;
  vendedorId: number;
  imagens: string[];
  favorito?: boolean;
  publicadoPeloUtilizador?: boolean;
  dataPublicacao: string;
}