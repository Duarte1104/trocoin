import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Utilizador } from '../models/utilizador';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UtilizadoresService {

  private jsonPath = 'assets/data/utilizadores.json';

  // chaves para o ionic storage
  private CHAVE_REGISTADOS = 'trocoin_utilizadores_registados';
  private CHAVE_SESSAO = 'trocoin_utilizador_atual_id';

  constructor(private http: HttpClient, private storageService: StorageService) {}

  // junta os utilizadores do json com os registados na app
  async listarUtilizadores(): Promise<Utilizador[]> {
    const doJson = await firstValueFrom(this.http.get<Utilizador[]>(this.jsonPath));
    const registados = await this.storageService.obter<Utilizador[]>(this.CHAVE_REGISTADOS) || [];
    return [...doJson, ...registados];
  }

  async obterUtilizadorPorId(id: number): Promise<Utilizador | undefined> {
    const lista = await this.listarUtilizadores();
    return lista.find(u => u.id === id);
  }

  // devolve o utilizador que está com sessão ativa
  async obterUtilizadorAtual(): Promise<Utilizador | undefined> {
    const id = await this.storageService.obter<number>(this.CHAVE_SESSAO);
    if (!id) return undefined;
    return this.obterUtilizadorPorId(id);
  }

  async obterIdUtilizadorAtual(): Promise<number> {
    const id = await this.storageService.obter<number>(this.CHAVE_SESSAO);
    return id || 0;
  }

  // verifica as credenciais e guarda o id no storage se estiverem corretas
  async login(email: string, senha: string): Promise<Utilizador | null> {
    const lista = await this.listarUtilizadores();
    const user = lista.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );

    if (user) {
      await this.storageService.guardar(this.CHAVE_SESSAO, user.id);
      return user;
    }

    return null;
  }

  async logout(): Promise<void> {
    await this.storageService.remover(this.CHAVE_SESSAO);
  }

  // cria uma conta nova e inicia sessão automaticamente
  async registar(nome: string, email: string, senha: string): Promise<Utilizador | null> {
    const lista = await this.listarUtilizadores();

    // verificar se o email já existe
    const existe = lista.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existe) return null;

    const registados = await this.storageService.obter<Utilizador[]>(this.CHAVE_REGISTADOS) || [];

    const novo: Utilizador = {
      id: Date.now(),
      nome: nome.trim(),
      username: email.split('@')[0].toLowerCase(),
      email: email.trim(),
      senha: senha,
      avaliacao: 5
    };

    registados.push(novo);
    await this.storageService.guardar(this.CHAVE_REGISTADOS, registados);
    await this.storageService.guardar(this.CHAVE_SESSAO, novo.id);

    return novo;
  }
}
