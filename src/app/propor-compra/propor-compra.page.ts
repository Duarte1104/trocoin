import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';

import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { PropostasService } from '../services/propostas.service';

@Component({
  selector: 'app-propor-compra',
  templateUrl: './propor-compra.page.html',
  styleUrls: ['./propor-compra.page.scss'],
  standalone: false
})
export class ProporCompraPage implements OnInit {
  public anuncio?: Anuncio;
  public vendedor?: Utilizador;
  public utilizadorAtual?: Utilizador;

  public valorProposto: number | null = null;
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

    this.anuncio = await this.anunciosService.obterAnuncioPorId(anuncioId);

    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
      this.valorProposto = this.anuncio.preco;
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

  public podeEnviarProposta(): boolean {
    if (!this.anuncio || !this.utilizadorAtual || !this.valorProposto) {
      return false;
    }

    return (
      this.anuncio.tipo === 'venda' &&
      this.anuncio.vendedorId !== this.utilizadorAtual.id &&
      (this.anuncio.estadoAnuncio || 'ativo') === 'ativo' &&
      this.valorProposto > 0 &&
      this.valorProposto <= this.anuncio.preco
    );
  }

  public async enviarPropostaCompra(): Promise<void> {
    if (!this.anuncio || !this.utilizadorAtual || !this.valorProposto) {
      await this.mostrarMensagem('Preenche o valor da proposta.');
      return;
    }

    if (this.valorProposto > this.anuncio.preco) {
      await this.mostrarMensagem('A proposta não pode ser superior ao preço do anúncio.');
      return;
    }

    const proposta = await this.propostasService.criarPropostaCompra(
      this.anuncio,
      this.utilizadorAtual.id,
      Number(this.valorProposto),
      this.mensagem.trim()
    );

    if (!proposta) {
      await this.mostrarMensagem('Não foi possível criar a proposta. Verifica se já tens uma proposta em aberto.');
      return;
    }

    await this.mostrarMensagem('Proposta enviada ao vendedor.');
    this.router.navigateByUrl(`/conversa/${proposta.conversaId}`);
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio?.imagens?.length) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
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