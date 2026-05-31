import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Conversa } from '../models/conversa';
import { Mensagem } from '../models/mensagem';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';

import { MensagensService } from '../services/mensagens.service';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.page.html',
  styleUrls: ['./conversa.page.scss'],
  standalone: false
})
export class ConversaPage implements OnInit {
  public conversa?: Conversa;
  public mensagens: Mensagem[] = [];
  public anuncio?: Anuncio;
  public outroUtilizador?: Utilizador;
  public novaMensagem = '';
  public utilizadorAtualId = 0;
  public carregando = true;

  // controla visibilidade dos botões de proposta com base no tipo do anúncio
  public podeComprar = false;
  public podeTrocar = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mensagensService: MensagensService,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando = true;
    this.utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.carregando = false; return; }

    this.conversa = await this.mensagensService.obterConversaPorId(id);

    if (this.conversa) {
      this.mensagens = await this.mensagensService.listarMensagensPorConversa(this.conversa.id);
      this.anuncio = await this.anunciosService.obterAnuncioPorId(this.conversa.anuncioId);

      // o outro utilizador é quem não somos nós
      const outroId = this.conversa.utilizadorId === this.utilizadorAtualId
        ? this.conversa.outroUtilizadorId
        : this.conversa.utilizadorId;

      this.outroUtilizador = await this.utilizadoresService.obterUtilizadorPorId(outroId);

      // botões de proposta dependem do tipo do anúncio e de não ser o próprio vendedor
      const ehVendedor = this.anuncio?.vendedorId === this.utilizadorAtualId;
      if (this.anuncio && !ehVendedor) {
        this.podeComprar = this.anuncio.tipo === 'venda' || this.anuncio.tipo === 'venda-troca';
        this.podeTrocar = this.anuncio.tipo === 'troca' || this.anuncio.tipo === 'venda-troca';
      }
    }

    this.carregando = false;
  }

  public voltar(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }

  public async enviarMensagem(): Promise<void> {
    const texto = this.novaMensagem.trim();
    if (!texto || !this.conversa) return;

    await this.mensagensService.enviarMensagem(
      this.conversa.id,
      this.conversa.anuncioId,
      this.utilizadorAtualId,
      texto,
      'texto'
    );

    this.novaMensagem = '';
    await this.carregar();
  }

  public proporCompra(): void {
    if (this.conversa) this.router.navigateByUrl(`/propor-compra/${this.conversa.anuncioId}`);
  }

  public proporTroca(): void {
    if (this.conversa) this.router.navigateByUrl(`/propor-troca/${this.conversa.anuncioId}`);
  }

  public abrirDetalheAnuncio(): void {
    if (this.conversa) this.router.navigateByUrl(`/detalhe-anuncio/${this.conversa.anuncioId}`);
  }

  public mensagemDoUtilizador(m: Mensagem): boolean {
    return m.remetenteId === this.utilizadorAtualId;
  }

  public obterNomeTopo(): string {
    return this.outroUtilizador?.nome || 'Conversa';
  }

  public obterImagemAnuncio(): string {
    if (!this.anuncio?.imagens?.length) return 'assets/img/moedas/moeda-ouro.png';
    return this.anuncio.imagens[0];
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(preco);
  }
}
