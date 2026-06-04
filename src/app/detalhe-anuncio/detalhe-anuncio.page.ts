import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
  public utilizadorAtual?: Utilizador;

  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
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

  private async carregarDetalhe(): Promise<void> {
    this.carregando = true;

    const anuncioId = Number(this.route.snapshot.paramMap.get('id'));

    this.utilizadorAtual = await this.utilizadoresService.obterUtilizadorAtual();

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

  public anuncioAtivo(): boolean {
    return (this.anuncio?.estadoAnuncio || 'ativo') === 'ativo';
  }

  public anuncioVendido(): boolean {
    return this.anuncio?.estadoAnuncio === 'vendido';
  }

  public anuncioTrocado(): boolean {
  return this.anuncio?.estadoAnuncio === 'trocado';
}

  public anuncioMeu(): boolean {
    return !!this.anuncio &&
      !!this.utilizadorAtual &&
      this.anuncio.vendedorId === this.utilizadorAtual.id;
  }

  public fuiComprador(): boolean {
    return !!this.anuncio &&
      !!this.utilizadorAtual &&
      this.anuncio.compradorId === this.utilizadorAtual.id;
  }

  public possoProporCompra(): boolean {
    return !!this.anuncio &&
      this.anuncioAtivo() &&
      !this.anuncioMeu() &&
      this.anuncio.tipo === 'venda';
  }

  public possoProporTroca(): boolean {
    return !!this.anuncio &&
      this.anuncioAtivo() &&
      !this.anuncioMeu() &&
      this.anuncio.tipo === 'troca';
  }

  public possoEnviarMensagem(): boolean {
    return !!this.anuncio &&
      this.anuncioAtivo() &&
      !this.anuncioMeu() &&
      !!this.utilizadorAtual;
  }

  public async alternarFavorito(): Promise<void> {
    if (!this.anuncio || !this.anuncioAtivo()) {
      return;
    }

    await this.anunciosService.alternarFavorito(this.anuncio.id);
    await this.carregarDetalhe();
  }

  public async contactarVendedor(): Promise<void> {
    if (!this.anuncio || !this.utilizadorAtual || !this.possoEnviarMensagem()) {
      await this.mostrarMensagem('Este anúncio já não está disponível para contacto.');
      return;
    }

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.utilizadorAtual.id,
      this.anuncio.vendedorId
    );

    this.router.navigateByUrl(`/conversa/${conversa.id}`);
  }

  public proporCompra(): void {
    if (!this.anuncio || !this.possoProporCompra()) {
      return;
    }

    this.router.navigateByUrl(`/propor-compra/${this.anuncio.id}`);
  }

  public proporTroca(): void {
    if (!this.anuncio || !this.possoProporTroca()) {
      return;
    }

    this.router.navigateByUrl(`/propor-troca/${this.anuncio.id}`);
  }

  public obterTituloEstado(): string {
  if (!this.anuncio) {
    return '';
  }

  if (this.anuncioTrocado()) {
    return 'Moeda trocada';
  }

  if (this.anuncioVendido() && this.fuiComprador()) {
    return 'Moeda comprada';
  }

  if (this.anuncioVendido() && this.anuncioMeu()) {
    return 'Moeda vendida';
  }

  if (this.anuncioVendido()) {
    return 'Anúncio indisponível';
  }

  return 'Anúncio ativo';
}

 public obterTextoEstado(): string {
  if (!this.anuncio) {
    return '';
  }

  if (this.anuncioTrocado()) {
    return 'Esta moeda esteve envolvida numa troca concluída. Este ecrã serve apenas para consulta.';
  }

  if (this.anuncioVendido() && this.fuiComprador()) {
    return 'Esta moeda foi comprada por ti. Este ecrã serve apenas para consulta.';
  }

  if (this.anuncioVendido() && this.anuncioMeu()) {
    return 'Esta moeda foi vendida por ti. O valor já foi adicionado ao teu saldo.';
  }

  if (this.anuncioVendido()) {
    return 'Esta moeda já foi vendida e deixou de estar disponível para outros utilizadores.';
  }

  if (this.anuncioMeu()) {
    return 'Este anúncio foi publicado por ti.';
  }

  return 'Esta moeda ainda está disponível para negociação.';
}
  public obterTextoTipo(): string {
    if (!this.anuncio) {
      return '';
    }

    return this.anuncio.tipo === 'venda' ? 'Venda' : 'Troca';
  }

  public obterTextoVendasVendedor(): string {
    const vendas = this.vendedor?.vendasConcluidas || 0;

    if (vendas === 1) {
      return '1 venda concluída';
    }

    return `${vendas} vendas concluídas`;
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
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

  public obterPrecoPrincipal(): string {
    if (!this.anuncio) {
      return '';
    }

    return this.formatarPreco(this.anuncio.precoFinal || this.anuncio.preco);
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