import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { MensagensService } from '../services/mensagens.service';

@Component({
  selector: 'app-propor-compra',
  templateUrl: './propor-compra.page.html',
  styleUrls: ['./propor-compra.page.scss'],
  standalone: false
})
export class ProporCompraPage implements OnInit {
  public anuncio?: Anuncio;
  public vendedor?: Utilizador;

  public valorProposto: number | null = null;
  public metodoPagamento = 'Transferência bancária';
  public observacoes = '';
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncio();
  }

  // Carrega o anúncio através do ID recebido na rota
  private async carregarAnuncio(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const anuncioId = Number(idRecebido);

    if (!anuncioId) {
      this.carregando = false;
      return;
    }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(anuncioId);

    if (this.anuncio) {
      this.valorProposto = this.anuncio.preco;
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
    }

    this.carregando = false;
  }

  public voltar(): void {
    if (this.anuncio) {
      this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncio.id}`);
      return;
    }

    this.router.navigateByUrl('/tabs/pesquisar');
  }

  // Envia uma proposta de compra através das mensagens da app
  public async enviarPropostaCompra(): Promise<void> {
    if (!this.anuncio || !this.valorProposto) {
      return;
    }

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.anuncio.vendedorId
    );

    const textoProposta =
      `Proposta de compra: ${this.formatarPreco(this.valorProposto)}. ` +
      `Método de pagamento: ${this.metodoPagamento}. ` +
      `${this.observacoes ? 'Observações: ' + this.observacoes : ''}`;

    await this.mensagensService.enviarMensagem(
      conversa.id,
      this.anuncio.id,
      1,
      textoProposta,
      'proposta-compra'
    );

    this.router.navigateByUrl(`/compra-realizada/${this.anuncio.id}`);
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
}