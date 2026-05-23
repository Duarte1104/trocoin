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
  /** Dados do anúncio a mostrar */
  public anuncio?: Anuncio;

  /** Dados do vendedor deste anúncio */
  public vendedor?: Utilizador;

  /** Controla o indicador de carregamento */
  public carregando = true;

  /** Indica se o anúncio pertence ao utilizador com sessão ativa */
  public anuncioMeu = false;

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

  /**
   * Carrega os dados do anúncio através do ID recebido na rota.
   * Verifica também se o anúncio pertence ao utilizador atual para
   * ocultar os botões de proposta (não faz sentido propor a si próprio).
   */
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

      // Verificar se o anúncio pertence ao utilizador com sessão ativa
      const utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();
      this.anuncioMeu = this.anuncio.vendedorId === utilizadorAtualId;
    }

    this.carregando = false;
  }

  /** Volta para a listagem de anúncios */
  public voltar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  /** Adiciona ou remove o anúncio dos favoritos */
  public async alternarFavorito(): Promise<void> {
    if (!this.anuncio) {
      return;
    }

    await this.anunciosService.alternarFavorito(this.anuncio.id);
    await this.carregarDetalhe();
  }

  /** Cria ou abre uma conversa com o vendedor deste anúncio */
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

  /** Navega para a página de proposta de compra */
  public proporCompra(): void {
    if (!this.anuncio) {
      return;
    }

    this.router.navigateByUrl(`/propor-compra/${this.anuncio.id}`);
  }

  /** Navega para a página de proposta de troca */
  public proporTroca(): void {
    if (!this.anuncio) {
      return;
    }

    this.router.navigateByUrl(`/propor-troca/${this.anuncio.id}`);
  }

  /** Formata um valor em euros para exibição */
  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  /** Devolve a imagem principal do anúncio ou uma imagem por omissão */
  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }

  /** Devolve o texto legível do tipo de anúncio */
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
