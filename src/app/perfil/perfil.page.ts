import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { Utilizador } from '../models/utilizador';
import { Anuncio } from '../models/anuncio';

import { UtilizadoresService } from '../services/utilizadores.service';
import { AnunciosService } from '../services/anuncios.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  public utilizador?: Utilizador;
  public meusAnuncios: Anuncio[] = [];
  public carregando = true;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private utilizadoresService: UtilizadoresService,
    private anunciosService: AnunciosService,
    private storageService: StorageService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarPerfil();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarPerfil();
  }

  // Carrega os dados do utilizador atual e os anúncios publicados por ele
  private async carregarPerfil(): Promise<void> {
    this.carregando = true;

    this.utilizador = await this.utilizadoresService.obterUtilizadorAtual();

    const anuncios = await this.anunciosService.listarAnuncios();

    this.meusAnuncios = anuncios.filter(anuncio =>
      anuncio.vendedorId === 1 || anuncio.publicadoPeloUtilizador
    );

    this.carregando = false;
  }

  public abrirAnuncio(anuncioId: number): void {
    this.router.navigateByUrl(`/detalhe-anuncio/${anuncioId}`);
  }

  public publicarNovoAnuncio(): void {
    this.router.navigateByUrl('/tabs/novo-anuncio');
  }

  public abrirAjuda(): void {
    this.router.navigateByUrl('/ajuda');
  }

  public voltarPesquisa(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  // Confirma e limpa os dados guardados localmente no Ionic Storage
  public async confirmarLimparDados(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Limpar dados locais?',
      message: 'Esta ação remove anúncios criados, favoritos e mensagens guardadas no dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpar',
          role: 'destructive',
          handler: async () => {
            await this.storageService.limparTudo();
            await this.carregarPerfil();
          }
        }
      ]
    });

    await alerta.present();
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(anuncio: Anuncio): string {
    if (!anuncio.imagens || anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return anuncio.imagens[0];
  }

  public obterAvatar(): string {
    if (!this.utilizador) {
      return 'U';
    }

    return this.utilizador.avatar || this.utilizador.nome.charAt(0);
  }
}