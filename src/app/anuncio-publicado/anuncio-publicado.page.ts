import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { AnunciosService } from '../services/anuncios.service';

@Component({
  selector: 'app-anuncio-publicado',
  templateUrl: './anuncio-publicado.page.html',
  styleUrls: ['./anuncio-publicado.page.scss'],
  standalone: false
})
export class AnuncioPublicadoPage implements OnInit {
  public anuncio?: Anuncio;
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncio();
  }

  // Carrega o anúncio acabado de publicar através do ID recebido na rota
  private async carregarAnuncio(): Promise<void> {
    this.carregando = true;

    const idRecebido = this.route.snapshot.paramMap.get('id');
    const anuncioId = Number(idRecebido);

    if (!anuncioId) {
      this.carregando = false;
      return;
    }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(anuncioId);
    this.carregando = false;
  }

  public verAnuncio(): void {
    if (!this.anuncio) {
      return;
    }

    this.router.navigateByUrl(`/detalhe-anuncio/${this.anuncio.id}`);
  }

  public publicarOutro(): void {
    this.router.navigateByUrl('/tabs/novo-anuncio');
  }

  public voltarPesquisar(): void {
    this.router.navigateByUrl('/tabs/pesquisar');
  }

  public irPerfil(): void {
    this.router.navigateByUrl('/tabs/perfil');
  }

  public obterImagemPrincipal(): string {
    if (!this.anuncio || !this.anuncio.imagens || this.anuncio.imagens.length === 0) {
      return 'assets/img/moedas/moeda-ouro.png';
    }

    return this.anuncio.imagens[0];
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }
}