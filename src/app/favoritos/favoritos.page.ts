import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';

interface AnuncioFavorito extends Anuncio {
  vendedor?: Utilizador;
}

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false
})
export class FavoritosPage implements OnInit {
  public favoritos: AnuncioFavorito[] = [];
  public carregando = true;

  constructor(
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarFavoritos();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarFavoritos();
  }

  // Carrega os anúncios favoritos guardados no Ionic Storage
  private async carregarFavoritos(): Promise<void> {
    this.carregando = true;

    const utilizadorAtual = await this.utilizadoresService.obterUtilizadorAtual();

      if (!utilizadorAtual) {
        this.favoritos = [];
        this.carregando = false;
        return;
      }

const favoritos = await this.anunciosService.listarFavoritos();
    const utilizadores = await this.utilizadoresService.listarUtilizadores();

    this.favoritos = favoritos.map(anuncio => ({
      ...anuncio,
      vendedor: utilizadores.find(utilizador => utilizador.id === anuncio.vendedorId)
    }));

    this.carregando = false;
  }

  public abrirDetalhe(anuncioId: number): void {
    this.router.navigateByUrl(`/detalhe-anuncio/${anuncioId}`);
  }

  public async removerFavorito(event: Event, anuncioId: number): Promise<void> {
    event.stopPropagation();

    await this.anunciosService.alternarFavorito(anuncioId);
    await this.carregarFavoritos();
  }

  public irPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(anuncio: Anuncio): string {
    if (!anuncio.imagens || anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return anuncio.imagens[0];
  }
}