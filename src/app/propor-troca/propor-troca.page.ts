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
  /** Dados do anúncio sobre o qual se faz a proposta */
  public anuncio?: Anuncio;

  /** Dados do vendedor do anúncio */
  public vendedor?: Utilizador;

  /** Nome da moeda que o utilizador pretende oferecer */
  public moedaOferecida = '';

  /** Estado de conservação da moeda a oferecer */
  public estadoMoeda = 'Bom';

  /** Mensagem opcional ao vendedor */
  public descricaoTroca = '';

  /** Controla o indicador de carregamento */
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService,
    private toastController: ToastController
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncio();
  }

  /**
   * Carrega os dados do anúncio através do ID recebido na rota.
   */
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
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
    }

    this.carregando = false;
  }

  /** Volta para o detalhe do anúncio */
  public voltar(): void {
    if (this.anuncio) {
      this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncio.id}`);
      return;
    }

    this.router.navigateByUrl('/tabs/pesquisar');
  }

  /**
   * Envia a proposta de troca ao vendedor através das mensagens da app.
   * Usa o ID do utilizador com sessão ativa como remetente.
   */
  public async enviarPropostaTroca(): Promise<void> {
    if (!this.anuncio || !this.moedaOferecida.trim()) {
      const toast = await this.toastController.create({
        message: 'Indica a moeda que pretendes oferecer.',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Obter o ID do utilizador com sessão ativa
    const utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.anuncio.vendedorId
    );

    const textoProposta =
      `Proposta de troca: ofereço "${this.moedaOferecida}" ` +
      `em estado "${this.estadoMoeda}". ` +
      `${this.descricaoTroca ? 'Mensagem: ' + this.descricaoTroca : ''}`;

    await this.mensagensService.enviarMensagem(
      conversa.id,
      this.anuncio.id,
      utilizadorAtualId,
      textoProposta,
      'proposta-troca'
    );

    this.router.navigateByUrl(`/confirmacao-troca/${this.anuncio.id}`);
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
}
