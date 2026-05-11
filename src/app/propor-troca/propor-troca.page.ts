import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
import { MensagensService } from '../services/mensagens.service';

@Component({
  selector: 'app-propor-troca',
  templateUrl: './propor-troca.page.html',
  styleUrls: ['./propor-troca.page.scss'],
  standalone: false
})
export class ProporTrocaPage implements OnInit {
  public anuncio?: Anuncio;
  public vendedor?: Utilizador;

  public moedaOferecida = '';
  public estadoMoeda = 'Bom';
  public descricaoTroca = '';
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
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

    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
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

  // Envia uma proposta de troca através das mensagens da app
  public async enviarPropostaTroca(): Promise<void> {
    if (!this.anuncio || !this.moedaOferecida.trim()) {
      return;
    }

    const conversa = await this.mensagensService.criarConversa(
      this.anuncio.id,
      this.anuncio.vendedorId
    );

    const textoProposta =
      `Proposta de troca: ofereço "${this.moedaOferecida}" ` +
      `em estado "${this.estadoMoeda}". ` +
      `${this.descricaoTroca ? 'Descrição: ' + this.descricaoTroca : ''}`;

    await this.mensagensService.enviarMensagem(
      conversa.id,
      this.anuncio.id,
      1,
      textoProposta,
      'proposta-troca'
    );

    this.router.navigateByUrl(`/confirmacao-troca/${this.anuncio.id}`);
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }
}