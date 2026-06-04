export interface Utilizador {
  id: number;

  nome: string;
  username: string;
  email: string;
  senha?: string;

  morada?: string;
  avatar?: string;

  vendasConcluidas?: number;
  saldo?: number;
}