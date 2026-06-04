export type EstadoConversa =
  | 'ativa'
  | 'aguarda-resposta'
  | 'proposta-aceite'
  | 'proposta-recusada'
  | 'aguarda-pagamento'
  | 'pagamento-efetuado'
  | 'concluida';

export interface Conversa {
  id: number;
  anuncioId: number;

  compradorId: number;
  vendedorId: number;

  ultimaMensagem: string;
  dataUltimaMensagem: string;
  mensagensNaoLidas: number;

  estado: EstadoConversa;
}