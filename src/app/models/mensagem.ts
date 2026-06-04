export type TipoMensagem =
  | 'texto'
  | 'sistema'
  | 'proposta-compra'
  | 'proposta-troca'
  | 'proposta-aceite'
  | 'proposta-recusada'
  | 'pagamento-efetuado'
  | 'negocio-concluido';

export interface Mensagem {
  id: number;
  conversaId: number;
  anuncioId: number;

  remetenteId: number;

  texto: string;
  data: string;

  tipo: TipoMensagem;

  propostaId?: number;
}