import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-criar-conta',
  templateUrl: './criar-conta.page.html',
  styleUrls: ['./criar-conta.page.scss'],
  standalone: false
})
export class CriarContaPage {

  constructor(private router: Router) {}

  // Volta para o ecrã de login
  public voltar(): void {
    this.router.navigateByUrl('/login');
  }

  // Simula a criação de conta e entra na app
  public criarConta(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }
}