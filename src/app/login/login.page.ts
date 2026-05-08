import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {

  constructor(private router: Router) {}

  // Simula o login e encaminha o utilizador para a página principal da app
  public entrar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  // Encaminha o utilizador para a criação de conta
  public criarConta(): void {
    this.router.navigateByUrl('/criar-conta');
  }
}