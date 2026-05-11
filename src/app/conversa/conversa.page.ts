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
  public utilizadorAtualId = 1;
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mensagensService: MensagensService,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarConversa();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarConversa();
  }

  // Carrega a conversa através do ID recebido na rota
  private async carregarConversa(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const conversaId = Number(idRecebido);

    if (!conversaId) {
      this.carregando = false;
      return;
    }

    this.conversa = await this.mensagensService.obterConversaPorId(conversaId);

    if (this.conversa) {
      this.mensagens = await this.mensagensService.listarMensagensPorConversa(this.conversa.id);
      this.anuncio = await this.anunciosService.obterAnuncioPorId(this.conversa.anuncioId);
      this.outroUtilizador = await this.utilizadoresService.obterUtilizadorPorId(this.conversa.outroUtilizadorId);
    }

    this.carregando = false;
  }

  public voltar(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }

  // Envia uma mensagem escrita pelo utilizador
  public async enviarMensagem(): Promise<void> {
    const texto = this.novaMensagem.trim();

    if (!texto || !this.conversa) {
      return;
    }

    await this.mensagensService.enviarMensagem(
      this.conversa.id,
      this.conversa.anuncioId,
      this.utilizadorAtualId,
      texto,
      'texto'
    );

    this.novaMensagem = '';
    await this.carregarConversa();
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

  public abrirDetalheAnuncio(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/detalhe-anuncio/${this.conversa.anuncioId}`);
  }

  public mensagemDoUtilizador(mensagem: Mensagem): boolean {
    return mensagem.remetenteId === this.utilizadorAtualId;
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
}