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
  /** Dados da conversa atual */
  public conversa?: Conversa;

  /** Lista de mensagens desta conversa */
  public mensagens: Mensagem[] = [];

  /** Dados do anúncio relacionado com a conversa */
  public anuncio?: Anuncio;

  /** Dados do outro utilizador nesta conversa */
  public outroUtilizador?: Utilizador;

  /** Texto da nova mensagem a enviar */
  public novaMensagem = '';

  /** ID do utilizador com sessão ativa */
  public utilizadorAtualId = 0;

  /** Controla o indicador de carregamento */
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

  /**
   * Carrega a conversa e as suas mensagens através do ID recebido na rota.
   * Lê também o ID do utilizador atual do Ionic Storage para distinguir
   * as mensagens enviadas das recebidas.
   */
  private async carregarConversa(): Promise<void> {
    this.carregando = true;

    // Obter o ID do utilizador com sessão ativa
    this.utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();

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

  /** Volta para a lista de mensagens */
  public voltar(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }

  /**
   * Envia a mensagem escrita pelo utilizador para esta conversa.
   * Usa o ID do utilizador com sessão ativa como remetente.
   */
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

  /** Navega para a página de proposta de compra */
  public proporCompra(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/propor-compra/${this.conversa.anuncioId}`);
  }

  /** Navega para a página de proposta de troca */
  public proporTroca(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/propor-troca/${this.conversa.anuncioId}`);
  }

  /** Abre o detalhe do anúncio relacionado com a conversa */
  public abrirDetalheAnuncio(): void {
    if (!this.conversa) {
      return;
    }

    this.router.navigateByUrl(`/detalhe-anuncio/${this.conversa.anuncioId}`);
  }

  /** Verifica se a mensagem foi enviada pelo utilizador atual */
  public mensagemDoUtilizador(mensagem: Mensagem): boolean {
    return mensagem.remetenteId === this.utilizadorAtualId;
  }

  /** Devolve o nome do outro utilizador para o cabeçalho */
  public obterNomeTopo(): string {
    return this.outroUtilizador?.nome || 'Colecionador';
  }

  /** Devolve a imagem do anúncio ou uma imagem por omissão */
  public obterImagemAnuncio(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }

  /** Formata um valor em euros para exibição */
  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }
}
