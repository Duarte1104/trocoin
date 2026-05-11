import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {

  constructor() {
    this.iniciarApp();
  }

  // Método inicial da aplicação.
  // Aqui são configuradas funcionalidades globais da app.
  private async iniciarApp(): Promise<void> {
    await this.bloquearOrientacaoVertical();
  }

  // Bloqueia a aplicação em modo vertical quando está a correr num dispositivo físico.
  // Isto ajuda a cumprir o requisito de utilização do Capacitor para controlo do dispositivo.
  private async bloquearOrientacaoVertical(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await ScreenOrientation.lock({
        orientation: 'portrait'
      });
    } catch (erro) {
      console.warn('Não foi possível bloquear a orientação:', erro);
    }
  }
}