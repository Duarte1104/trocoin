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
  public anuncioMeu = false;
  public podeComprar = false;
  public podeTrocar = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService
  ) {}

  public async ngOnInit(): Promise<void> { await this.carregar(); }
  public async ionViewWillEnter(): Promise<void> { await this.carregar(); }

  private async carregar(): Promise<void> {
    this.carregando = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.carregando = false; return; }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(id);

    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
      const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
      this.anuncioMeu = this.anuncio.vendedorId === meuId;

      this.podeComprar = !this.anuncioMeu && (this.anuncio.tipo === 'venda' || this.anuncio.tipo === 'venda-troca');
      this.podeTrocar = !this.anuncioMeu && (this.anuncio.tipo === 'troca' || this.anuncio.tipo === 'venda-troca');
    }

    this.carregando = false;
  }

  public voltar(): void { this.router.navigateByUrl('/tabs/pesquisar'); }

  public async alternarFavorito(): Promise<void> {
    if (!this.anuncio) return;
    await this.anunciosService.alternarFavorito(this.anuncio.id);
    await this.carregar();
  }

  public async contactarVendedor(): Promise<void> {
    if (!this.anuncio) return;
    const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
    const conversa = await this.mensagensService.criarConversa(this.anuncio.id, this.anuncio.vendedorId, meuId);
    this.router.navigateByUrl(`/conversa/${conversa.id}`);
  }

  public proporCompra(): void {
    if (this.anuncio) this.router.navigateByUrl(`/propor-compra/${this.anuncio.id}`);
  }

  public proporTroca(): void {
    if (this.anuncio) this.router.navigateByUrl(`/propor-troca/${this.anuncio.id}`);
  }

  public formatarPreco(p: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p);
  }

  public obterImagemPrincipal(): string {
    return this.anuncio?.imagens?.length ? this.anuncio.imagens[0] : 'assets/img/moedas/moeda-ouro.png';
  }

  public obterTextoTipo(): string {
    if (this.anuncio?.tipo === 'venda') return 'Venda';
    if (this.anuncio?.tipo === 'troca') return 'Troca';
    return 'Venda ou troca';
  }
}
