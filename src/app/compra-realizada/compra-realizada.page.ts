import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anuncio } from '../models/anuncio';
import { AnunciosService } from '../services/anuncios.service';
import { MensagensService } from '../services/mensagens.service';
import { UtilizadoresService } from '../services/utilizadores.service';

@Component({
  selector: 'app-compra-realizada',
  templateUrl: './compra-realizada.page.html',
  styleUrls: ['./compra-realizada.page.scss'],
  standalone: false
})
export class CompraRealizadaPage implements OnInit {
  public anuncio?: Anuncio;
  public conversaId: number | null = null;
  public carregando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private anunciosService: AnunciosService,
    private mensagensService: MensagensService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.carregando = false; return; }

    this.anuncio = await this.anunciosService.obterAnuncioPorId(id);

    if (this.anuncio) {
      const meuId = await this.utilizadoresService.obterIdUtilizadorAtual();
      const conversa = await this.mensagensService.criarConversa(this.anuncio.id, this.anuncio.vendedorId, meuId);
      this.conversaId = conversa.id;
    }
    this.carregando = false;
  }

  public voltarPesquisar(): void { this.router.navigateByUrl('/tabs/pesquisar'); }
  public irInbox(): void { this.router.navigateByUrl('/tabs/mensagens'); }

  public abrirConversa(): void {
    if (this.conversaId) this.router.navigateByUrl(`/conversa/${this.conversaId}`);
    else this.router.navigateByUrl('/tabs/mensagens');
  }

  public obterImagemPrincipal(): string {
    return this.anuncio?.imagens?.length ? this.anuncio.imagens[0] : 'assets/img/moedas/moeda-ouro.png';
  }
}
