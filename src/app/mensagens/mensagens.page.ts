import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Conversa } from '../models/conversa';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { Mensagem } from '../models/mensagem';

import { MensagensService } from '../services/mensagens.service';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';

interface ConversaCard extends Conversa {
  anuncio?: Anuncio;
  outroUtilizador?: Utilizador;
  ultimaMensagemTexto?: string;
  horaUltimaMensagem?: string;
}

@Component({
  selector: 'app-mensagens',
  templateUrl: './mensagens.page.html',
  styleUrls: ['./mensagens.page.scss'],
  standalone: false
})
export class MensagensPage implements OnInit {
  public conversas: ConversaCard[] = [];
  public carregando = true;
  private utilizadorAtualId = 0;

  constructor(
    private router: Router,
    private mensagensService: MensagensService,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarConversas();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarConversas();
  }

  // Carrega apenas as conversas do utilizador atual, com dados do anúncio e do outro participante
  private async carregarConversas(): Promise<void> {
    this.carregando = true;

    this.utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();

    // buscar só as conversas do utilizador em sessão
    const conversasBase = await this.mensagensService.listarConversasDoUtilizador(this.utilizadorAtualId);

    this.conversas = await Promise.all(
      conversasBase.map(async conversa => {
        const anuncio = await this.anunciosService.obterAnuncioPorId(conversa.anuncioId);

        // o "outro utilizador" é quem não somos nós
        const outroId = conversa.utilizadorId === this.utilizadorAtualId
          ? conversa.outroUtilizadorId
          : conversa.utilizadorId;

        const outroUtilizador = await this.utilizadoresService.obterUtilizadorPorId(outroId);
        const mensagens = await this.mensagensService.listarMensagensPorConversa(conversa.id);
        const ultima = mensagens.length > 0 ? mensagens[mensagens.length - 1] : undefined;

        return {
          ...conversa,
          anuncio,
          outroUtilizador,
          ultimaMensagemTexto: ultima?.texto || conversa.ultimaMensagem || 'Sem mensagens',
          horaUltimaMensagem: ultima?.data || conversa.dataUltimaMensagem || ''
        };
      })
    );

    this.carregando = false;
  }

  public abrirConversa(conversaId: number): void {
    this.router.navigateByUrl(`/conversa/${conversaId}`);
  }

  public abrirPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public obterImagemAnuncio(conversa: ConversaCard): string {
    if (!conversa.anuncio?.imagens?.length) return 'assets/img/moedas/moeda-ouro.png';
    return conversa.anuncio.imagens[0];
  }

  public obterNomeUtilizador(conversa: ConversaCard): string {
    return conversa.outroUtilizador?.nome || 'Colecionador';
  }

  public obterUsername(conversa: ConversaCard): string {
    return conversa.outroUtilizador?.username || 'utilizador';
  }
}
