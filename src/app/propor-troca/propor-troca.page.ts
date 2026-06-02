import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { MensagensService } from '../services/mensagens.service';

@Component({
  selector: 'app-propor-troca',
  templateUrl: './propor-troca.page.html',
  styleUrls: ['./propor-troca.page.scss'],
  standalone: false
})
export class ProporTrocaPage implements OnInit {
  public anuncio?: Anuncio;
  public vendedor?: Utilizador;
  public carregando = true;

  // anúncios do utilizador atual para oferecer na troca
  public meusAnuncios: Anuncio[] = [];

  // id do anúncio selecionado para oferecer
  public anuncioSelecionadoId: number | null = null;

  // dinheiro que o utilizador oferece além da moeda (a minha moeda vale menos)
  public dinheiroAOferecer: number | null = null;

  // dinheiro que o utilizador quer receber além da moeda (a minha moeda vale mais)
  public dinheiroAReceber: number | null = null;

  // mensagem opcional ao vendedor
  public descricaoTroca = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService,
    private toastController: ToastController
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.carregando = false; return; }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(id);

    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);

      // carregar os próprios anúncios para oferecer na troca
      const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
      const todos = await this.anunciosService.listarAnuncios();
      this.meusAnuncios = todos.filter(a =>
        (a.vendedorId === meuId || a.publicadoPeloUtilizador) && a.id !== id
      );
    }

    this.carregando = false;
  }

  public voltar(): void {
    if (this.anuncio) {
      this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncio.id}`);
    } else {
      this.router.navigateByUrl('/tabs/pesquisar');
    }
  }

  public obterAnuncioSelecionado(): Anuncio | undefined {
    return this.meusAnuncios.find(a => a.id === this.anuncioSelecionadoId);
  }

  public selecionarAnuncio(id: number): void {
    // se clicar no mesmo, deseleciona
    this.anuncioSelecionadoId = this.anuncioSelecionadoId === id ? null : id;
  }

  public async enviarPropostaTroca(): Promise<void> {
    if (!this.anuncio) return;

    if (!this.anuncioSelecionadoId && !this.descricaoTroca.trim()) {
      const t = await this.toastController.create({
        message: 'Seleciona uma das tuas moedas ou escreve uma mensagem.',
        duration: 2200, position: 'bottom', color: 'warning'
      });
      await t.present();
      return;
    }

    const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id, this.anuncio.vendedorId, meuId
    );

    const escolhido = this.obterAnuncioSelecionado();
    let texto = '🔄 Proposta de troca: ';

    if (escolhido) {
      texto += `"${escolhido.titulo}" (${this.formatarPreco(escolhido.preco)}, estado: ${escolhido.estadoConservacao})`;
    }

    if (this.dinheiroAOferecer && this.dinheiroAOferecer > 0) {
      texto += escolhido
        ? ` + ${this.formatarPreco(this.dinheiroAOferecer)} que ofereço`
        : `${this.formatarPreco(this.dinheiroAOferecer)} que ofereço`;
    }

    if (this.dinheiroAReceber && this.dinheiroAReceber > 0) {
      texto += escolhido
        ? ` + peço ${this.formatarPreco(this.dinheiroAReceber)} de volta`
        : `Peço ${this.formatarPreco(this.dinheiroAReceber)} de volta`;
    }

    if (this.descricaoTroca.trim()) {
      texto += `. Mensagem: ${this.descricaoTroca}`;
    }

    await this.mensagensService.enviarMensagem(
      conversa.id, this.anuncio.id, meuId, texto, 'proposta-troca'
    );

    this.router.navigateByUrl(`/confirmacao-troca/${this.anuncio.id}`);
  }

  public formatarPreco(p: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p);
  }

  public obterImagemAnuncio(a: Anuncio): string {
    return a.imagens?.length ? a.imagens[0] : 'assets/img/moedas/moeda-ouro.png';
  }

  public obterImagemPrincipal(): string {
    return this.anuncio?.imagens?.length ? this.anuncio.imagens[0] : 'assets/img/moedas/moeda-ouro.png';
  }
}
