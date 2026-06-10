import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';

import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { MensagensService } from '../services/mensagens.service';
import { PropostasService } from '../services/propostas.service';

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
    private alertController: AlertController,
    private toastController: ToastController,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private mensagensService: MensagensService,
    private propostasService: PropostasService
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
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(
        this.anuncio.vendedorId
      );
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

  public async proporTroca(): Promise<void> {
    if (!this.anuncio || !this.utilizadorAtual || !this.possoProporTroca()) {
      return;
    }

    const meusAnuncios = await this.anunciosService.listarAnunciosDoUtilizador(
      this.utilizadorAtual.id
    );

    const moedasDisponiveis = meusAnuncios.filter(anuncio =>
      anuncio.id !== this.anuncio!.id &&
      (anuncio.estadoAnuncio || 'ativo') === 'ativo'
    );

    if (moedasDisponiveis.length === 0) {
      const alerta = await this.alertController.create({
        header: 'Não tens moedas para trocar',
        message: 'Para propor uma troca tens de ter pelo menos uma moeda publicada e ativa. Publica primeiro uma moeda tua.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Publicar moeda',
            handler: () => {
              this.router.navigateByUrl('/tabs/novo-anuncio');
            }
          }
        ]
      });

      await alerta.present();
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

  public obterIconeEstado(): string {
    if (this.anuncioVendido() || this.anuncioTrocado()) {
      return 'checkmark-circle-outline';
    }

    return 'information-circle-outline';
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

  public podeRemoverAnuncio(): boolean {
    return !!this.anuncio &&
      !!this.utilizadorAtual &&
      this.anuncioMeu() &&
      (this.anuncio.estadoAnuncio || 'ativo') === 'ativo';
  }

  public async confirmarRemoverAnuncio(): Promise<void> {
    if (!this.anuncio || !this.utilizadorAtual || !this.podeRemoverAnuncio()) {
      return;
    }

    const alerta = await this.alertController.create({
      header: 'Remover anúncio?',
      message: 'O anúncio será removido e todas as conversas/propostas associadas a este anúncio também serão apagadas. Esta ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            await this.propostasService.removerPropostasPorAnuncio(this.anuncio!.id);
            await this.mensagensService.removerConversasPorAnuncio(this.anuncio!.id);

            const removido = await this.anunciosService.removerAnuncioProprio(
              this.anuncio!.id,
              this.utilizadorAtual!.id
            );

            if (removido) {
              await this.mostrarMensagem('Anúncio removido com sucesso.');
              this.router.navigateByUrl('/tabs/perfil');
            } else {
              await this.mostrarMensagem('Não foi possível remover este anúncio.');
            }
          }
        }
      ]
    });

    await alerta.present();
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