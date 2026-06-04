import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { Conversa } from '../models/conversa';
import { Mensagem } from '../models/mensagem';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { Proposta } from '../models/proposta';

import { MensagensService } from '../services/mensagens.service';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { PropostasService } from '../services/propostas.service';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.page.html',
  styleUrls: ['./conversa.page.scss'],
  standalone: false
})
export class ConversaPage implements OnInit {
  public conversa?: Conversa;
  public mensagens: Mensagem[] = [];
  public propostas: Proposta[] = [];

  public anuncio?: Anuncio;
  public outroUtilizador?: Utilizador;
  public utilizadorAtual?: Utilizador;

  public novaMensagem = '';
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private mensagensService: MensagensService,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private propostasService: PropostasService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarConversa();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarConversa();
  }

  private async carregarConversa(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const conversaId = Number(idRecebido);

    this.utilizadorAtual = await this.utilizadoresService.obterUtilizadorAtual();

    if (!conversaId || !this.utilizadorAtual) {
      this.carregando = false;
      return;
    }

    this.conversa = await this.mensagensService.obterConversaPorId(conversaId);

    if (this.conversa) {
      this.mensagens = await this.mensagensService.listarMensagensPorConversa(this.conversa.id);
      this.propostas = await this.propostasService.listarPropostasPorConversa(this.conversa.id);
      this.anuncio = await this.anunciosService.obterAnuncioPorId(this.conversa.anuncioId);

      const outroId = this.conversa.compradorId === this.utilizadorAtual.id
        ? this.conversa.vendedorId
        : this.conversa.compradorId;

      this.outroUtilizador = await this.utilizadoresService.obterUtilizadorPorId(outroId);
    }

    this.carregando = false;
  }

  public voltar(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }

  public async enviarMensagem(): Promise<void> {
    const texto = this.novaMensagem.trim();

    if (!texto || !this.conversa || !this.utilizadorAtual) {
      return;
    }

    await this.mensagensService.enviarMensagem(
      this.conversa.id,
      this.conversa.anuncioId,
      this.utilizadorAtual.id,
      texto,
      'texto'
    );

    this.novaMensagem = '';
    await this.carregarConversa();
  }

  public abrirDetalheAnuncio(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/detalhe-anuncio/${this.conversa.anuncioId}`);
  }

  public proporCompra(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/propor-compra/${this.conversa.anuncioId}`);
  }

  public proporTroca(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/propor-troca/${this.conversa.anuncioId}`);
  }

  public async aceitarProposta(proposta: Proposta): Promise<void> {
    if (!this.utilizadorAtual) {
      return;
    }

    const ok = await this.propostasService.aceitarProposta(
      proposta.id,
      this.utilizadorAtual.id
    );

    await this.mostrarMensagem(ok ? 'Proposta aceite.' : 'Não foi possível aceitar a proposta.');
    await this.carregarConversa();
  }

  public async recusarProposta(proposta: Proposta): Promise<void> {
    if (!this.utilizadorAtual) {
      return;
    }

    const ok = await this.propostasService.recusarProposta(
      proposta.id,
      this.utilizadorAtual.id
    );

    await this.mostrarMensagem(ok ? 'Proposta recusada.' : 'Não foi possível recusar a proposta.');
    await this.carregarConversa();
  }

  public async efetuarPagamento(proposta: Proposta): Promise<void> {
    if (!this.utilizadorAtual) {
      return;
    }

    const ok = await this.propostasService.efetuarPagamento(
      proposta.id,
      this.utilizadorAtual.id
    );

    await this.mostrarMensagem(ok ? 'Pagamento efetuado com sucesso.' : 'Não foi possível efetuar o pagamento.');
    await this.carregarConversa();
  }

  public mensagemDoUtilizador(mensagem: Mensagem): boolean {
    return mensagem.remetenteId === this.utilizadorAtual?.id;
  }

  public souVendedor(): boolean {
    return !!this.conversa && !!this.utilizadorAtual &&
      this.conversa.vendedorId === this.utilizadorAtual.id;
  }

  public souComprador(): boolean {
    return !!this.conversa && !!this.utilizadorAtual &&
      this.conversa.compradorId === this.utilizadorAtual.id;
  }

  public podeCriarNovaProposta(): boolean {
    if (!this.anuncio || !this.souComprador()) {
      return false;
    }

    const estado = this.anuncio.estadoAnuncio || 'ativo';

    if (estado !== 'ativo') {
      return false;
    }

    const existePendenteOuAceite = this.propostas.some(proposta =>
      proposta.estado === 'pendente' ||
      proposta.estado === 'aceite' ||
      proposta.estado === 'paga'
    );

    return !existePendenteOuAceite;
  }

  public propostasOrdenadas(): Proposta[] {
    return [...this.propostas].sort((a, b) => b.id - a.id);
  }

  public obterNomeTopo(): string {
    return this.outroUtilizador?.nome || 'Colecionador';
  }

  public obterImagemAnuncio(): string {
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

  public textoEstadoProposta(proposta: Proposta): string {
    if (proposta.estado === 'pendente') {
      return 'A aguardar resposta do vendedor';
    }

    if (proposta.estado === 'aceite') {
      return 'Proposta aceite. A aguardar pagamento';
    }

    if (proposta.estado === 'recusada') {
      return 'Proposta recusada';
    }

    if (proposta.estado === 'paga') {
      return 'Pagamento efetuado';
    }

    return 'Concluída';
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