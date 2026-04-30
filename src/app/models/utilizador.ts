export interface Utilizador {
  id: number;
  nome: string;
  username: string;
  email: string;
  morada?: string;
  avatar?: string;
  avaliacao?: number;
}