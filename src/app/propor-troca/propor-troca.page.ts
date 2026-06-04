import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';

import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { PropostasService } from '../services/propostas.service';

@Component({
  selector: 'app-propor-troca',
  templateUrl: './propor-troca.page.html',
  styleUrls: ['./propor-troca.page.scss'],
  standalone: false
})
export class ProporTrocaPage implements OnInit {
  public anuncioPretendido?: Anuncio;
  public vendedor?: Utilizador;
  public utilizadorAtual?: Utilizador;

  public meusAnuncios: Anuncio[] = [];
  public anuncioOferecidoId: number | null = null;
  public valorExtraOferecido: number | null = 0;
  public mensagem = '';

  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private propostasService: PropostasService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  private async carregarDados(): Promise<void> {
    this.carregando = true;

    const anuncioId = Number(this.route.snapshot.paramMap.get('id'));
    this.utilizadorAtual = await this.utilizadoresService.obterUtilizadorAtual();

    if (!anuncioId || !this.utilizadorAtual) {
      this.carregando = false;
      return;
    }

    this.anuncioPretendido = await this.anunciosService.obterAnuncioPorId(anuncioId);

    if (this.anuncioPretendido) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(
        this.anuncioPretendido.vendedorId
      );
    }

    const anunciosDoUtilizador = await this.anunciosService.listarAnunciosDoUtilizador(
      this.utilizadorAtual.id
    );

    this.meusAnuncios = anunciosDoUtilizador.filter(anuncio =>
      anuncio.id !== anuncioId &&
      (anuncio.estadoAnuncio || 'ativo') === 'ativo'
    );

    this.carregando = false;
  }

  public voltar(): void {
    if (this.anuncioPretendido) {
      this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncioPretendido.id}`);
      return;
    }

    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public podeEnviarProposta(): boolean {
    if (!this.anuncioPretendido || !this.utilizadorAtual || !this.anuncioOferecidoId) {
      return false;
    }

    return (
      this.anuncioPretendido.tipo === 'troca' &&
      this.anuncioPretendido.vendedorId !== this.utilizadorAtual.id &&
      (this.anuncioPretendido.estadoAnuncio || 'ativo') === 'ativo'
    );
  }

  public obterAnuncioOferecido(): Anuncio | undefined {
    if (!this.anuncioOferecidoId) {
      return undefined;
    }

    return this.meusAnuncios.find(anuncio => anuncio.id === Number(this.anuncioOferecidoId));
  }

  public async enviarPropostaTroca(): Promise<void> {
    if (!this.anuncioPretendido || !this.utilizadorAtual || !this.anuncioOferecidoId) {
      await this.mostrarMensagem('Escolhe uma moeda tua para oferecer em troca.');
      return;
    }

    const anuncioOferecido = await this.anunciosService.obterAnuncioPorId(
      Number(this.anuncioOferecidoId)
    );

    if (!anuncioOferecido) {
      await this.mostrarMensagem('Não foi possível encontrar a moeda oferecida.');
      return;
    }

    const proposta = await this.propostasService.criarPropostaTroca(
      this.anuncioPretendido,
      anuncioOferecido,
      this.utilizadorAtual.id,
      Number(this.valorExtraOferecido || 0),
      this.mensagem.trim()
    );

    if (!proposta) {
      await this.mostrarMensagem('Não foi possível enviar a proposta. Verifica se já existe uma proposta em aberto.');
      return;
    }

    await this.mostrarMensagem('Proposta de troca enviada ao vendedor.');
    this.router.navigateByUrl(`/conversa/${proposta.conversaId}`);
  }

  public obterImagemPrincipal(anuncio?: Anuncio): string {
    if (!anuncio || !anuncio.imagens || anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return anuncio.imagens[0];
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  private async mostrarMensagem(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1800,
      position: 'bottom',
      color: 'dark'
    });

    await toast.present();
  }
}