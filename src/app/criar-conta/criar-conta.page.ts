import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { UtilizadoresService } from '../services/utilizadores.service';

@Component({
  selector: 'app-criar-conta',
  templateUrl: './criar-conta.page.html',
  styleUrls: ['./criar-conta.page.scss'],
  standalone: false
})
export class CriarContaPage {
  /** Nome completo introduzido pelo utilizador */
  public nome = '';

  /** Email introduzido pelo utilizador */
  public email = '';

  /** Senha escolhida pelo utilizador */
  public senha = '';

  /** Confirmação da senha */
  public confirmarSenha = '';

  /** Controla a visibilidade da senha */
  public mostrarSenha = false;

  /** Indica se o utilizador aceitou os termos e condições */
  public termosAceites = false;

  constructor(
    private router: Router,
    private utilizadoresService: UtilizadoresService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  /** Volta para o ecrã de login */
  public voltar(): void {
    this.router.navigateByUrl('/login');
  }

  /** Alterna a visibilidade da senha */
  public alternarVisibilidadeSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }


  public async abrirTermos(): Promise<void> {
  const alerta = await this.alertController.create({
    header: 'Termos e condições',
    message:
      'Ao criar conta na Trocoin, comprometes-te a publicar apenas anúncios reais, usar fotografias adequadas, comunicar com respeito com outros colecionadores e combinar compras ou trocas de forma responsável. A Trocoin funciona como protótipo académico e os dados são guardados localmente no dispositivo.',
    buttons: [
      {
        text: 'Fechar',
        role: 'cancel'
      },
      {
        text: 'Aceitar',
        handler: () => {
          this.termosAceites = true;
        }
      }
    ]
  });

  await alerta.present();
}


  /**
   * Valida os campos e cria uma nova conta, guardando o utilizador no Ionic Storage.
   * Após criar a conta, inicia sessão automaticamente e redireciona para a app.
   */
  public async criarConta(): Promise<void> {
    if (!this.nome.trim()) {
      await this.mostrarErro('Introduz o teu nome completo.');
      return;
    }

    if (!this.email.trim() || !this.email.includes('@')) {
      await this.mostrarErro('Introduz um email válido.');
      return;
    }

    if (this.senha.length < 6) {
      await this.mostrarErro('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      await this.mostrarErro('As palavras-passe não coincidem.');
      return;
    }

    if (!this.termosAceites) {
      await this.mostrarErro('Aceita os termos e condições para continuar.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'A criar conta...',
      duration: 3000
    });
    await loading.present();

    const novoUtilizador = await this.utilizadoresService.registar(
      this.nome.trim(),
      this.email.trim(),
      this.senha
    );
    await loading.dismiss();

    if (novoUtilizador) {
      await this.mostrarSucesso('Conta criada com sucesso! Bem-vindo ao Trocoin.');
      this.router.navigateByUrl('/tabs/pesquisar', { replaceUrl: true });
    } else {
      await this.mostrarErro('Este email já está registado. Tenta iniciar sessão.');
    }
  }

  /** Mostra uma mensagem de erro */
  private async mostrarErro(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  /** Mostra uma mensagem de sucesso */
  private async mostrarSucesso(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}
