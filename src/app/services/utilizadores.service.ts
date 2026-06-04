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

  private CHAVE_REGISTADOS = 'trocoin_utilizadores_registados';
  private CHAVE_ATUALIZADOS = 'trocoin_utilizadores_atualizados';
  private CHAVE_SESSAO = 'trocoin_utilizador_atual_id';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public async listarUtilizadores(): Promise<Utilizador[]> {
    const doJson = await firstValueFrom(this.http.get<Utilizador[]>(this.jsonPath));
    const registados = await this.storageService.obter<Utilizador[]>(this.CHAVE_REGISTADOS) || [];
    const atualizados = await this.storageService.obter<Utilizador[]>(this.CHAVE_ATUALIZADOS) || [];

    const todos = [...doJson, ...registados];

    return todos.map(utilizador => {
      const atualizado = atualizados.find(u => u.id === utilizador.id);

      return {
        ...utilizador,
        ...atualizado,
        vendasConcluidas: atualizado?.vendasConcluidas ?? utilizador.vendasConcluidas ?? 0,
        saldo: atualizado?.saldo ?? utilizador.saldo ?? 0
      };
    });
  }

  public async obterUtilizadorPorId(id: number): Promise<Utilizador | undefined> {
    const lista = await this.listarUtilizadores();
    return lista.find(utilizador => utilizador.id === id);
  }

  public async obterUtilizadorAtual(): Promise<Utilizador | undefined> {
    const id = await this.storageService.obter<number>(this.CHAVE_SESSAO);

    if (!id) {
      return undefined;
    }

    return await this.obterUtilizadorPorId(id);
  }

  public async obterIdUtilizadorAtual(): Promise<number> {
    const id = await this.storageService.obter<number>(this.CHAVE_SESSAO);
    return id || 0;
  }

  public async login(email: string, senha: string): Promise<Utilizador | null> {
    const lista = await this.listarUtilizadores();

    const user = lista.find(utilizador =>
      utilizador.email.toLowerCase() === email.toLowerCase() &&
      utilizador.senha === senha
    );

    if (!user) {
      return null;
    }

    await this.storageService.guardar(this.CHAVE_SESSAO, user.id);
    return user;
  }

  public async logout(): Promise<void> {
    await this.storageService.remover(this.CHAVE_SESSAO);
  }

  public async registar(nome: string, email: string, senha: string): Promise<Utilizador | null> {
    const lista = await this.listarUtilizadores();

    const existe = lista.some(utilizador =>
      utilizador.email.toLowerCase() === email.toLowerCase()
    );

    if (existe) {
      return null;
    }

    const registados = await this.storageService.obter<Utilizador[]>(this.CHAVE_REGISTADOS) || [];

    const novo: Utilizador = {
      id: Date.now(),
      nome: nome.trim(),
      username: email.split('@')[0].toLowerCase(),
      email: email.trim(),
      senha,
      vendasConcluidas: 0,
      saldo: 0
    };

    registados.push(novo);

    await this.storageService.guardar(this.CHAVE_REGISTADOS, registados);
    await this.storageService.guardar(this.CHAVE_SESSAO, novo.id);

    return novo;
  }

  public async atualizarUtilizador(utilizadorAtualizado: Utilizador): Promise<void> {
    const registados = await this.storageService.obter<Utilizador[]>(this.CHAVE_REGISTADOS) || [];
    const indiceRegistado = registados.findIndex(u => u.id === utilizadorAtualizado.id);

    if (indiceRegistado !== -1) {
      registados[indiceRegistado] = utilizadorAtualizado;
      await this.storageService.guardar(this.CHAVE_REGISTADOS, registados);
      return;
    }

    const atualizados = await this.storageService.obter<Utilizador[]>(this.CHAVE_ATUALIZADOS) || [];
    const indiceAtualizado = atualizados.findIndex(u => u.id === utilizadorAtualizado.id);

    if (indiceAtualizado !== -1) {
      atualizados[indiceAtualizado] = utilizadorAtualizado;
    } else {
      atualizados.push(utilizadorAtualizado);
    }

    await this.storageService.guardar(this.CHAVE_ATUALIZADOS, atualizados);
  }

  public async concluirVenda(vendedorId: number, valor: number): Promise<void> {
    const vendedor = await this.obterUtilizadorPorId(vendedorId);

    if (!vendedor) {
      return;
    }

    const atualizado: Utilizador = {
      ...vendedor,
      saldo: (vendedor.saldo || 0) + valor,
      vendasConcluidas: (vendedor.vendasConcluidas || 0) + 1
    };

    await this.atualizarUtilizador(atualizado);
  }

  public async adicionarSaldo(utilizadorId: number, valor: number): Promise<void> {
  if (valor <= 0) {
    return;
  }

  const utilizador = await this.obterUtilizadorPorId(utilizadorId);

  if (!utilizador) {
    return;
  }

  const atualizado: Utilizador = {
    ...utilizador,
    saldo: (utilizador.saldo || 0) + valor
  };

  await this.atualizarUtilizador(atualizado);
}
}