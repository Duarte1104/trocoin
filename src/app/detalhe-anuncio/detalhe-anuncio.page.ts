import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { MensagensService } from '../services/mensagens.service';

@Component({
  selector: 'app-detalhe-anuncio',
  templateUrl: './detalhe-anuncio.page.html',
  styleUrls: ['./detalhe-anuncio.page.scss'],
  standalone: false
})
export class DetalheAnuncioPage implements OnInit {
  public anuncio?: Anuncio;
  public vendedor?: Utilizador;
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarDetalhe();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarDetalhe();
  }

  // Carrega o anúncio através do ID recebido na rota
  private async carregarDetalhe(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const anuncioId = Number(idRecebido);

    if (!anuncioId) {
      this.carregando = false;
      return;
    }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(anuncioId);

    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
    }

    this.carregando = false;
  }

  public voltar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  // Adiciona ou remove o anúncio dos favoritos
  public async alternarFavorito(): Promise<void> {
    if (!this.anuncio) {
      return;
    }

    await this.anunciosService.alternarFavorito(this.anuncio.id);
    await this.carregarDetalhe();
  }

  // Cria ou abre uma conversa com o vendedor
  public async contactarVendedor(): Promise<void> {
    if (!this.anuncio) {
      return;
    }

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.anuncio.vendedorId
    );

    this.router.navigateByUrl(`/conversa/${conversa.id}`);
  }

  public proporCompra(): void {
    if (!this.anuncio) {
      return;
    }

    this.router.navigateByUrl(`/propor-compra/${this.anuncio.id}`);
  }

  public proporTroca(): void {
    if (!this.anuncio) {
      return;
    }

    this.router.navigateByUrl(`/propor-troca/${this.anuncio.id}`);
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }

  public obterTextoTipo(): string {
    if (!this.anuncio) {
      return '';
    }

    if (this.anuncio.tipo === 'venda') {
      return 'Venda';
    }

    if (this.anuncio.tipo === 'troca') {
      return 'Troca';
    }

    return 'Venda ou troca';
  }
}