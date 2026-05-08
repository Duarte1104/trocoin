import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Utilizador } from '../models/utilizador';

@Injectable({
  providedIn: 'root'
})
export class UtilizadoresService {
  private caminhoJson = 'assets/data/utilizadores.json';

  constructor(private http: HttpClient) {}

  public async listarUtilizadores(): Promise<Utilizador[]> {
    return await firstValueFrom(this.http.get<Utilizador[]>(this.caminhoJson));
  }

  public async obterUtilizadorPorId(id: number): Promise<Utilizador | undefined> {
    const utilizadores = await this.listarUtilizadores();
    return utilizadores.find(utilizador => utilizador.id === id);
  }

  public async obterUtilizadorAtual(): Promise<Utilizador | undefined> {
    return await this.obterUtilizadorPorId(1);
  }
}