export interface Conversa {
  id: number;
  anuncioId: number;
  utilizadorId: number;
  outroUtilizadorId: number;
  ultimaMensagem: string;
  dataUltimaMensagem: string;
  mensagensNaoLidas: number;
}