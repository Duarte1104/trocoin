export interface Mensagem {
  id: number;
  conversaId: number;
  anuncioId: number;
  remetenteId: number;
  texto: string;
  data: string;
  tipo?: 'texto' | 'proposta-compra' | 'proposta-troca';
}