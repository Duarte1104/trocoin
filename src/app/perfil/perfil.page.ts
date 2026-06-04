import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { Utilizador } from '../models/utilizador';
import { Anuncio } from '../models/anuncio';

import { UtilizadoresService } from '../services/utilizadores.service';
import { AnunciosService } from '../services/anuncios.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  public utilizador?: Utilizador;

 public meusAnuncios: Anuncio[] = [];
public moedasCompradas: Anuncio[] = [];
public moedasVendidas: Anuncio[] = [];
public moedasTrocadas: Anuncio[] = [];

  public carregando = true;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private utilizadoresService: UtilizadoresService,
    private anunciosService: AnunciosService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarPerfil();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarPerfil();
  }

  private async carregarPerfil(): Promise<void> {
    this.carregando = true;

    this.utilizador = await this.utilizadoresService.obterUtilizadorAtual();

    if (!this.utilizador) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      this.carregando = false;
      return;
    }

    this.meusAnuncios = await this.anunciosService.listarAnunciosDoUtilizador(this.utilizador.id);
this.moedasCompradas = await this.anunciosService.listarMoedasCompradas(this.utilizador.id);
this.moedasVendidas = await this.anunciosService.listarMoedasVendidas(this.utilizador.id);
this.moedasTrocadas = await this.anunciosService.listarMoedasTrocadas(this.utilizador.id);

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

  public async confirmarTerminarSessao(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Terminar sessão?',
      message: 'Vais voltar para o ecrã de login.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Terminar sessão',
          role: 'destructive',
          handler: async () => {
            await this.utilizadoresService.logout();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });

    await alerta.present();
  }

  public obterAvatar(): string {
    if (!this.utilizador) {
      return 'U';
    }

    return this.utilizador.avatar || this.utilizador.nome.charAt(0).toUpperCase();
  }

  public obterTextoVendas(): string {
    const vendas = this.utilizador?.vendasConcluidas || 0;

    if (vendas === 0) {
      return 'Ainda sem vendas concluídas';
    }

    if (vendas === 1) {
      return '1 venda concluída';
    }

    return `${vendas} vendas concluídas`;
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public formatarSaldo(): string {
    return this.formatarPreco(this.utilizador?.saldo || 0);
  }

  public obterImagemPrincipal(anuncio: Anuncio): string {
    if (!anuncio.imagens || anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return anuncio.imagens[0];
  }
}