import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajuda',
  templateUrl: './ajuda.page.html',
  styleUrls: ['./ajuda.page.scss'],
  standalone: false
})
export class AjudaPage {

  constructor(private router: Router) {}

  public voltar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public irPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public irPublicar(): void {
    this.router.navigateByUrl('/tabs/novo-anuncio');
  }

  public irMensagens(): void {
    this.router.navigateByUrl('/tabs/mensagens');
  }
}