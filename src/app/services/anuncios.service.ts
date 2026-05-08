import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Anuncio } from '../models/anuncio';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {
  private caminhoJson = 'assets/data/anuncios.json';
  private chaveAnunciosCriados = 'trocoin_anuncios_criados';
  private chaveFavoritos = 'trocoin_favoritos';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public async listarAnuncios(): Promise<Anuncio[]> {
    const anunciosJson = await firstValueFrom(this.http.get<Anuncio[]>(this.caminhoJson));
    const anunciosCriados = await this.storageService.obter<Anuncio[]>(this.chaveAnunciosCriados) || [];
    const favoritos = await this.storageService.obter<number[]>(this.chaveFavoritos) || [];

    const todosAnuncios = [...anunciosJson, ...anunciosCriados];

    return todosAnuncios.map(anuncio => ({
      ...anuncio,
      favorito: favoritos.includes(anuncio.id)
    }));
  }

  public async obterAnuncioPorId(id: number): Promise<Anuncio | undefined> {
    const anuncios = await this.listarAnuncios();
    return anuncios.find(anuncio => anuncio.id === id);
  }

  public async pesquisarAnuncios(termo: string): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();

    if (!termo.trim()) {
      return anuncios;
    }

    const termoPesquisa = termo.toLowerCase();

    return anuncios.filter(anuncio =>
      anuncio.titulo.toLowerCase().includes(termoPesquisa) ||
      anuncio.descricao.toLowerCase().includes(termoPesquisa) ||
      anuncio.estadoConservacao.toLowerCase().includes(termoPesquisa) ||
      anuncio.localizacao.toLowerCase().includes(termoPesquisa)
    );
  }

  public async criarAnuncio(anuncio: Omit<Anuncio, 'id' | 'dataPublicacao'>): Promise<Anuncio> {
    const anunciosCriados = await this.storageService.obter<Anuncio[]>(this.chaveAnunciosCriados) || [];

    const novoAnuncio: Anuncio = {
      ...anuncio,
      id: Date.now(),
      dataPublicacao: new Date().toISOString(),
      publicadoPeloUtilizador: true,
      favorito: false
    };

    anunciosCriados.push(novoAnuncio);

    await this.storageService.guardar(this.chaveAnunciosCriados, anunciosCriados);

    return novoAnuncio;
  }

  public async alternarFavorito(anuncioId: number): Promise<void> {
    const favoritos = await this.storageService.obter<number[]>(this.chaveFavoritos) || [];

    const jaExiste = favoritos.includes(anuncioId);

    const favoritosAtualizados = jaExiste
      ? favoritos.filter(id => id !== anuncioId)
      : [...favoritos, anuncioId];

    await this.storageService.guardar(this.chaveFavoritos, favoritosAtualizados);
  }

  public async listarFavoritos(): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();
    return anuncios.filter(anuncio => anuncio.favorito);
  }
}