import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

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
  /** Dados do utilizador com sessão ativa */
  public utilizador?: Utilizador;

  /** Lista de anúncios publicados pelo utilizador */
  public meusAnuncios: Anuncio[] = [];

  /** Controla o indicador de carregamento */
  public carregando = true;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
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

  /**
   * Carrega os dados do utilizador com sessão ativa e os seus anúncios.
   * Filtra os anúncios pelo ID do utilizador atual lido do Ionic Storage.
   */
  private async carregarPerfil(): Promise<void> {
    this.carregando = true;

    this.utilizador = await this.utilizadoresService.obterUtilizadorAtual();

    if (this.utilizador) {
      const anuncios = await this.anunciosService.listarAnuncios();

      // Mostrar apenas os anúncios do utilizador com sessão ativa
      this.meusAnuncios = anuncios.filter(anuncio =>
        anuncio.vendedorId === this.utilizador!.id || anuncio.publicadoPeloUtilizador
      );
    }

    this.carregando = false;
  }

  /** Abre o detalhe de um anúncio */
  public abrirAnuncio(anuncioId: number): void {
    this.router.navigateByUrl(`/detalhe-anuncio/${anuncioId}`);
  }

  /** Navega para a página de publicar novo anúncio */
  public publicarNovoAnuncio(): void {
    this.router.navigateByUrl('/tabs/novo-anuncio');
  }

  /** Navega para a página de ajuda */
  public abrirAjuda(): void {
    this.router.navigateByUrl('/ajuda');
  }

  /** Navega para a pesquisa */
  public voltarPesquisa(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  /**
   * Pede confirmação e termina a sessão do utilizador,
   * redirecionando para o ecrã de login.
   */
  public async confirmarTerminarSessao(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Terminar sessão?',
      message: 'Terás de voltar a iniciar sessão para aceder à app.',
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

  /**
   * Pede confirmação e limpa os dados guardados localmente no Ionic Storage.
   */
  public async confirmarLimparDados(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Limpar dados locais?',
      message: 'Esta ação remove anúncios criados, favoritos e mensagens guardadas no dispositivo. A sessão será mantida.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpar',
          role: 'destructive',
          handler: async () => {
            // Guardar o ID do utilizador antes de limpar
            const utilizadorId = await this.utilizadoresService.obterIdUtilizadorAtual();
            await this.storageService.limparTudo();
            // Repor a sessão do utilizador após limpeza
            if (utilizadorId) {
              await this.storageService.guardar('trocoin_utilizador_atual_id', utilizadorId);
            }
            await this.carregarPerfil();
            const toast = await this.toastController.create({
              message: 'Dados locais apagados.',
              duration: 1800,
              position: 'bottom',
              color: 'dark'
            });
            await toast.present();
          }
        }
      ]
    });

    await alerta.present();
  }

  /** Formata um valor em euros para exibição */
  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  /** Devolve a imagem principal do anúncio ou uma imagem por omissão */
  public obterImagemPrincipal(anuncio: Anuncio): string {
    if (!anuncio.imagens || anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return anuncio.imagens[0];
  }

  /** Devolve o avatar do utilizador (letra inicial se não tiver imagem) */
  public obterAvatar(): string {
    if (!this.utilizador) {
      return 'U';
    }

    return this.utilizador.avatar || this.utilizador.nome.charAt(0).toUpperCase();
  }
}
