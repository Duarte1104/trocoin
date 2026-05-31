import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
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
    private mensagensService: MensagensService,
    private toastController: ToastController
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  private async carregar(): Promise<void> {
    this.carregando = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.carregando = false; return; }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(id);
    if (this.anuncio) {
      this.vendedor = await this.utilizadoresService.obterUtilizadorPorId(this.anuncio.vendedorId);
    }
    this.carregando = false;
  }

  public voltar(): void {
    if (this.anuncio) {
      this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncio.id}`);
    } else {
      this.router.navigateByUrl('/tabs/pesquisar');
    }
  }

  public async enviarPropostaTroca(): Promise<void> {
    if (!this.anuncio || !this.moedaOferecida.trim()) {
      const t = await this.toastController.create({
        message: 'Indica a moeda que pretendes oferecer.',
        duration: 2000, position: 'bottom', color: 'warning'
      });
      await t.present();
      return;
    }

    const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
    const conversa = await this.mensagensService.criarConversa(this.anuncio.id, this.anuncio.vendedorId, meuId);

    const texto = `🔄 Proposta de troca: "${this.moedaOferecida}" em estado "${this.estadoMoeda}"${this.descricaoTroca ? '. ' + this.descricaoTroca : ''}`;

    await this.mensagensService.enviarMensagem(conversa.id, this.anuncio.id, meuId, texto, 'proposta-troca');
    this.router.navigateByUrl(`/confirmacao-troca/${this.anuncio.id}`);
  }

  public formatarPreco(p: number): string {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p);
  }

  public obterImagemPrincipal(): string {
    return this.anuncio?.imagens?.length ? this.anuncio.imagens[0] : 'assets/img/moedas/moeda-ouro.png';
  }
}
