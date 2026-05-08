import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Moeda } from '../models/moeda';

@Injectable({
  providedIn: 'root'
})
export class MoedasService {
  private caminhoJson = 'assets/data/moedas.json';

  constructor(private http: HttpClient) {}

  public async listarMoedas(): Promise<Moeda[]> {
    return await firstValueFrom(this.http.get<Moeda[]>(this.caminhoJson));
  }

  public async obterMoedaPorId(id: number): Promise<Moeda | undefined> {
    const moedas = await this.listarMoedas();
    return moedas.find(moeda => moeda.id === id);
  }

  public async pesquisarMoedas(termo: string): Promise<Moeda[]> {
    const moedas = await this.listarMoedas();

    if (!termo.trim()) {
      return moedas;
    }

    const termoPesquisa = termo.toLowerCase();

    return moedas.filter(moeda =>
      moeda.nome.toLowerCase().includes(termoPesquisa) ||
      moeda.pais.toLowerCase().includes(termoPesquisa) ||
      moeda.ano.toString().includes(termoPesquisa) ||
      moeda.estado.toLowerCase().includes(termoPesquisa)
    );
  }
}