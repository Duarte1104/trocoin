import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';

interface AnuncioCard extends Anuncio {
  vendedor?: Utilizador;
}

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.page.html',
  styleUrls: ['./pesquisar.page.scss'],
  standalone: false
})
export class PesquisarPage implements OnInit {
  public anuncios: AnuncioCard[] = [];
  public anunciosFiltrados: AnuncioCard[] = [];
  public termoPesquisa = '';

  constructor(
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncios();
  }

  // Sempre que a página volta a ser aberta, atualiza os anúncios
  public async ionViewWillEnter(): Promise<void> {
    await this.carregarAnuncios();
  }

  // Carrega anúncios e associa o vendedor a cada anúncio
  private async carregarAnuncios(): Promise<void> {
    const anuncios = await this.anunciosService.listarAnuncios();
    const utilizadores = await this.utilizadoresService.listarUtilizadores();

    this.anuncios = anuncios.map(anuncio => ({
      ...anuncio,
      vendedor: utilizadores.find(utilizador => utilizador.id === anuncio.vendedorId)
    }));

    this.anunciosFiltrados = [...this.anuncios];
  }

  // Pesquisa anúncios por texto escrito na barra de pesquisa
  public async pesquisar(event: any): Promise<void> {
    this.termoPesquisa = event.detail.value || '';

    if (!this.termoPesquisa.trim()) {
      this.anunciosFiltrados = [...this.anuncios];
      return;
    }

    const termo = this.termoPesquisa.toLowerCase();

    this.anunciosFiltrados = this.anuncios.filter(anuncio =>
      anuncio.titulo.toLowerCase().includes(termo) ||
      anuncio.descricao.toLowerCase().includes(termo) ||
      anuncio.estadoConservacao.toLowerCase().includes(termo) ||
      anuncio.localizacao.toLowerCase().includes(termo)
    );
  }

  // Limpa a pesquisa
  public limparPesquisa(): void {
    this.termoPesquisa = '';
    this.anunciosFiltrados = [...this.anuncios];
  }

  // Abre a página de detalhe, passando o ID do anúncio pela rota
  public abrirDetalhe(anuncioId: number): void {
    this.router.navigateByUrl(`/detalhe-anuncio/${anuncioId}`);
  }

  // Adiciona ou remove um anúncio dos favoritos
  public async alternarFavorito(event: Event, anuncioId: number): Promise<void> {
    event.stopPropagation();

    await this.anunciosService.alternarFavorito(anuncioId);
    await this.carregarAnuncios();

    if (this.termoPesquisa.trim()) {
      const termo = this.termoPesquisa.toLowerCase();
      this.anunciosFiltrados = this.anuncios.filter(anuncio =>
        anuncio.titulo.toLowerCase().includes(termo) ||
        anuncio.descricao.toLowerCase().includes(termo) ||
        anuncio.estadoConservacao.toLowerCase().includes(termo) ||
        anuncio.localizacao.toLowerCase().includes(termo)
      );
    }
  }

  // Encaminha para a página de ajuda
  public abrirAjuda(): void {
    this.router.navigateByUrl('/ajuda');
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(anuncio: Anuncio): string {
    return anuncio.imagens && anuncio.imagens.length > 0
      ? anuncio.imagens[0]
      : 'assets/img/moedas/moeda-ouro.png';
  }
}