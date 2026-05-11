import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { AnunciosService } from '../services/anuncios.service';
import { MensagensService } from '../services/mensagens.service';

@Component({
  selector: 'app-confirmacao-troca',
  templateUrl: './confirmacao-troca.page.html',
  styleUrls: ['./confirmacao-troca.page.scss'],
  standalone: false
})
export class ConfirmacaoTrocaPage implements OnInit {
  public anuncio?: Anuncio;
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private mensagensService: MensagensService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncio();
  }

  // Carrega o anúncio através do ID recebido na rota
  private async carregarAnuncio(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const anuncioId = Number(idRecebido);

    if (!anuncioId) {
      this.carregando = false;
      return;
    }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(anuncioId);
    this.carregando = false;
  }

  public async abrirConversa(): Promise<void> {
    if (!this.anuncio) {
      return;
    }

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.anuncio.vendedorId
    );

    this.router.navigateByUrl(`/conversa/${conversa.id}`);
  }

  public voltarPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public irInbox(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }
}