import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { UtilizadoresService } from '../services/utilizadores.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  /** Email introduzido pelo utilizador */
  public email = '';

  /** Senha introduzida pelo utilizador */
  public senha = '';

  /** Controla a visibilidade da senha */
  public mostrarSenha = false;

  constructor(
    private router: Router,
    private utilizadoresService: UtilizadoresService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  /** Encaminha o utilizador para a recuperação fictícia da palavra-passe */
    public recuperarPassword(): void {
      this.router.navigateByUrl('/recuperar-password');
    }

  /**
   * Tenta autenticar o utilizador com as credenciais introduzidas.
   * Se as credenciais forem válidas, redireciona para a página principal.
   * Caso contrário, mostra uma mensagem de erro.
   */
  public async entrar(): Promise<void> {
    if (!this.email.trim() || !this.senha.trim()) {
      await this.mostrarErro('Preenche o email e a palavra-passe.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'A entrar...',
      duration: 3000
    });
    await loading.present();

    const utilizador = await this.utilizadoresService.login(this.email.trim(), this.senha.trim());
    await loading.dismiss();

    if (utilizador) {
      this.router.navigateByUrl('/tabs/pesquisar', { replaceUrl: true });
    } else {
      await this.mostrarErro('Email ou palavra-passe incorretos.');
    }
  }

  /** Alterna a visibilidade da senha */
  public alternarVisibilidadeSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  /** Encaminha o utilizador para a criação de conta */
  public criarConta(): void {
    this.router.navigateByUrl('/criar-conta');
  }

  /** Mostra uma mensagem de erro em toast */
  private async mostrarErro(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2500,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}
