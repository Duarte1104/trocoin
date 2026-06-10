import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: false
})
export class RecuperarPasswordPage {
  public email = '';
  public enviado = false;

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  public voltar(): void {
    this.router.navigateByUrl('/login');
  }

  public async enviarRecuperacao(): Promise<void> {
    if (!this.email.trim()) {
      await this.mostrarMensagem('Insere o teu email.');
      return;
    }

    this.enviado = true;
    await this.mostrarMensagem('Email de recuperação enviado.');
  }

  private async mostrarMensagem(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2200,
      position: 'bottom',
      color: 'dark'
    });

    await toast.present();
  }
}