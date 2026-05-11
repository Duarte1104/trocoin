import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Conversa } from '../models/conversa';
import { Mensagem } from '../models/mensagem';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';

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

  // Carrega todas as conversas e junta dados do anúncio, vendedor e última mensagem
  private async carregarConversas(): Promise<void> {
    this.carregando = true;

    const conversasBase = await this.mensagensService.listarConversas();

    this.conversas = await Promise.all(
      conversasBase.map(async conversa => {
        const anuncio = await this.anunciosService.obterAnuncioPorId(conversa.anuncioId);
        const outroUtilizador = await this.utilizadoresService.obterUtilizadorPorId(conversa.outroUtilizadorId);
        const mensagens = await this.mensagensService.listarMensagensPorConversa(conversa.id);

        const ultimaMensagem = this.obterUltimaMensagem(mensagens);

        return {
          ...conversa,
          anuncio,
          outroUtilizador,
          ultimaMensagemTexto: ultimaMensagem?.texto || conversa.ultimaMensagem || 'Sem mensagens ainda',
          horaUltimaMensagem: ultimaMensagem?.data || conversa.dataUltimaMensagem || ''
        };
      })
    );

    this.carregando = false;
  }

  private obterUltimaMensagem(mensagens: Mensagem[]): Mensagem | undefined {
    if (mensagens.length === 0) {
      return undefined;
    }

    return mensagens[mensagens.length - 1];
  }

  public abrirConversa(conversaId: number): void {
    this.router.navigateByUrl(`/conversa/${conversaId}`);
  }

  public abrirPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public obterImagemAnuncio(conversa: ConversaCard): string {
    if (!conversa.anuncio || !conversa.anuncio.imagens || conversa.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return conversa.anuncio.imagens[0];
  }

  public obterNomeUtilizador(conversa: ConversaCard): string {
    return conversa.outroUtilizador?.nome || 'Colecionador';
  }

  public obterUsername(conversa: ConversaCard): string {
    return conversa.outroUtilizador?.username || 'utilizador';
  }
}