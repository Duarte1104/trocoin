import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Anuncio, EstadoAnuncio } from '../models/anuncio';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {
  private caminhoJson = 'assets/data/anuncios.json';

  private chaveAnunciosCriados = 'trocoin_anuncios_criados';
  private chaveAnunciosAtualizados = 'trocoin_anuncios_atualizados';
  private chaveFavoritos = 'trocoin_favoritos';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public async listarAnuncios(): Promise<Anuncio[]> {
    const anunciosJson = await firstValueFrom(
      this.http.get<Anuncio[]>(this.caminhoJson)
    );

    const anunciosCriados =
      await this.storageService.obter<Anuncio[]>(this.chaveAnunciosCriados) || [];

    const anunciosAtualizados =
      await this.storageService.obter<Anuncio[]>(this.chaveAnunciosAtualizados) || [];

    const favoritos =
      await this.storageService.obter<number[]>(this.chaveFavoritos) || [];

    return [...anunciosJson, ...anunciosCriados].map(anuncio => {
      const atualizado = anunciosAtualizados.find(a => a.id === anuncio.id);

      return {
        ...anuncio,
        ...atualizado,
        tipo: atualizado?.tipo || anuncio.tipo,
        estadoAnuncio: atualizado?.estadoAnuncio || anuncio.estadoAnuncio || 'ativo',
        favorito: favoritos.includes(anuncio.id)
      };
    });
  }

  public async listarAnunciosAtivos(): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();

    return anuncios.filter(anuncio =>
      (anuncio.estadoAnuncio || 'ativo') === 'ativo'
    );
  }

  public async listarAnunciosParaPesquisa(): Promise<Anuncio[]> {
    return await this.listarAnunciosAtivos();
  }

  public async obterAnuncioPorId(id: number): Promise<Anuncio | undefined> {
    const anuncios = await this.listarAnuncios();
    return anuncios.find(anuncio => anuncio.id === id);
  }

  public async pesquisarAnuncios(termo: string): Promise<Anuncio[]> {
    const anuncios = await this.listarAnunciosAtivos();

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
    const anunciosCriados =
      await this.storageService.obter<Anuncio[]>(this.chaveAnunciosCriados) || [];

    const novoAnuncio: Anuncio = {
      ...anuncio,
      id: Date.now(),
      dataPublicacao: new Date().toISOString(),
      publicadoPeloUtilizador: true,
      favorito: false,
      estadoAnuncio: 'ativo'
    };

    anunciosCriados.push(novoAnuncio);

    await this.storageService.guardar(this.chaveAnunciosCriados, anunciosCriados);

    return novoAnuncio;
  }

  public async atualizarAnuncio(anuncioAtualizado: Anuncio): Promise<void> {
    const anunciosCriados =
      await this.storageService.obter<Anuncio[]>(this.chaveAnunciosCriados) || [];

    const indiceCriado = anunciosCriados.findIndex(a => a.id === anuncioAtualizado.id);

    if (indiceCriado !== -1) {
      anunciosCriados[indiceCriado] = anuncioAtualizado;
      await this.storageService.guardar(this.chaveAnunciosCriados, anunciosCriados);
      return;
    }

    const atualizados =
      await this.storageService.obter<Anuncio[]>(this.chaveAnunciosAtualizados) || [];

    const indiceAtualizado = atualizados.findIndex(a => a.id === anuncioAtualizado.id);

    if (indiceAtualizado !== -1) {
      atualizados[indiceAtualizado] = anuncioAtualizado;
    } else {
      atualizados.push(anuncioAtualizado);
    }

    await this.storageService.guardar(this.chaveAnunciosAtualizados, atualizados);
  }

  public async marcarComoVendido(
    anuncioId: number,
    compradorId: number,
    precoFinal: number
  ): Promise<void> {
    const anuncio = await this.obterAnuncioPorId(anuncioId);

    if (!anuncio) {
      return;
    }

    const atualizado: Anuncio = {
      ...anuncio,
      estadoAnuncio: 'vendido',
      compradorId,
      precoFinal,
      dataConclusao: new Date().toISOString()
    };

    await this.atualizarAnuncio(atualizado);
  }

  public async alterarEstadoAnuncio(
    anuncioId: number,
    estado: EstadoAnuncio
  ): Promise<void> {
    const anuncio = await this.obterAnuncioPorId(anuncioId);

    if (!anuncio) {
      return;
    }

    await this.atualizarAnuncio({
      ...anuncio,
      estadoAnuncio: estado
    });
  }

  public async alternarFavorito(anuncioId: number): Promise<void> {
    const favoritos =
      await this.storageService.obter<number[]>(this.chaveFavoritos) || [];

    const favoritosAtualizados = favoritos.includes(anuncioId)
      ? favoritos.filter(id => id !== anuncioId)
      : [...favoritos, anuncioId];

    await this.storageService.guardar(this.chaveFavoritos, favoritosAtualizados);
  }

  public async listarFavoritos(): Promise<Anuncio[]> {
    const anuncios = await this.listarAnunciosAtivos();
    return anuncios.filter(anuncio => anuncio.favorito);
  }

  public async listarAnunciosDoUtilizador(utilizadorId: number): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();

    return anuncios.filter(anuncio =>
      anuncio.vendedorId === utilizadorId &&
      (anuncio.estadoAnuncio || 'ativo') === 'ativo'
    );
  }

  public async listarMoedasCompradas(utilizadorId: number): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();

    return anuncios.filter(anuncio =>
      anuncio.compradorId === utilizadorId &&
      anuncio.estadoAnuncio === 'vendido'
    );
  }

  public async listarMoedasVendidas(utilizadorId: number): Promise<Anuncio[]> {
    const anuncios = await this.listarAnuncios();

    return anuncios.filter(anuncio =>
      anuncio.vendedorId === utilizadorId &&
      anuncio.estadoAnuncio === 'vendido'
    );
  }

  public async listarMoedasTrocadas(utilizadorId: number): Promise<Anuncio[]> {
  const anuncios = await this.listarAnuncios();

  return anuncios.filter(anuncio =>
    anuncio.estadoAnuncio === 'trocado' &&
    (
      anuncio.vendedorId === utilizadorId ||
      anuncio.compradorId === utilizadorId
    )
  );
}
}