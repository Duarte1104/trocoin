import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Utilizador } from '../models/utilizador';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UtilizadoresService {
  /** Caminho para o ficheiro JSON com utilizadores de exemplo */
  private caminhoJson = 'assets/data/utilizadores.json';

  /** Chave de storage para utilizadores registados via app */
  private chaveUtilizadoresRegistados = 'trocoin_utilizadores_registados';

  /** Chave de storage para o ID do utilizador com sessão ativa */
  private chaveUtilizadorAtualId = 'trocoin_utilizador_atual_id';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  /**
   * Devolve todos os utilizadores: os do JSON + os registados via app.
   */
  public async listarUtilizadores(): Promise<Utilizador[]> {
    const utilizadoresJson = await firstValueFrom(this.http.get<Utilizador[]>(this.caminhoJson));
    const utilizadoresRegistados = await this.storageService.obter<Utilizador[]>(this.chaveUtilizadoresRegistados) || [];
    return [...utilizadoresJson, ...utilizadoresRegistados];
  }

  /**
   * Devolve um utilizador pelo seu ID.
   */
  public async obterUtilizadorPorId(id: number): Promise<Utilizador | undefined> {
    const utilizadores = await this.listarUtilizadores();
    return utilizadores.find(utilizador => utilizador.id === id);
  }

  /**
   * Devolve o utilizador com sessão ativa, lendo o ID guardado no Ionic Storage.
   */
  public async obterUtilizadorAtual(): Promise<Utilizador | undefined> {
    const id = await this.storageService.obter<number>(this.chaveUtilizadorAtualId);
    if (!id) {
      return undefined;
    }
    return this.obterUtilizadorPorId(id);
  }

  /**
   * Devolve o ID do utilizador com sessão ativa (ou 0 se não houver sessão).
   */
  public async obterIdUtilizadorAtual(): Promise<number> {
    const id = await this.storageService.obter<number>(this.chaveUtilizadorAtualId);
    return id || 0;
  }

  /**
   * Tenta fazer login com o email e senha fornecidos.
   * Se as credenciais estiverem corretas, guarda o ID no storage e devolve o utilizador.
   * Caso contrário devolve null.
   */
  public async login(email: string, senha: string): Promise<Utilizador | null> {
    const utilizadores = await this.listarUtilizadores();
    const utilizador = utilizadores.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );

    if (utilizador) {
      await this.storageService.guardar(this.chaveUtilizadorAtualId, utilizador.id);
      return utilizador;
    }

    return null;
  }

  /**
   * Termina a sessão do utilizador atual, removendo o ID do storage.
   */
  public async logout(): Promise<void> {
    await this.storageService.remover(this.chaveUtilizadorAtualId);
  }

  /**
   * Regista um novo utilizador e inicia sessão automaticamente.
   * Verifica se o email já está registado antes de criar a conta.
   */
  public async registar(nome: string, email: string, senha: string): Promise<Utilizador | null> {
    const utilizadores = await this.listarUtilizadores();

    // Verificar se o email já existe
    const jaExiste = utilizadores.some(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (jaExiste) {
      return null;
    }

    const utilizadoresRegistados = await this.storageService.obter<Utilizador[]>(this.chaveUtilizadoresRegistados) || [];

    // Gerar username a partir do email (parte antes do @)
    const novoUtilizador: Utilizador = {
      id: Date.now(),
      nome: nome.trim(),
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      email: email.trim(),
      senha,
      avaliacao: 5
    };

    utilizadoresRegistados.push(novoUtilizador);
    await this.storageService.guardar(this.chaveUtilizadoresRegistados, utilizadoresRegistados);

    // Iniciar sessão automaticamente
    await this.storageService.guardar(this.chaveUtilizadorAtualId, novoUtilizador.id);

    return novoUtilizador;
  }
}
