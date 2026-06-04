import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

import { Anuncio } from '../models/anuncio';
import { Utilizador } from '../models/utilizador';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';

interface AnuncioCard extends Anuncio {
  vendedor?: Utilizador;
}

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.page.html',
  styleUrls: ['./pesquisar.page.scss'],
  standalone: false
})
export class PesquisarPage implements OnInit {
  // Lista completa de anúncios carregados
  public anuncios: AnuncioCard[] = [];

  // Lista após aplicar pesquisa e filtros
  public anunciosFiltrados: AnuncioCard[] = [];

  // Texto da barra de pesquisa
  public termoPesquisa = '';

  // Filtros ativos (null = sem filtro)
  public filtroTipo: 'venda' | 'troca' | null = null;
  public filtroEstado: string | null = null;
  public filtroPreco: string | null = null;
  public filtroAno: string | null = null;

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.carregarAnuncios();
  }

  public async ionViewWillEnter(): Promise<void> {
    await this.carregarAnuncios();
  }

  // Carrega apenas anúncios ativos e associa o vendedor a cada um
  private async carregarAnuncios(): Promise<void> {
    const anuncios = await this.anunciosService.listarAnunciosAtivos();
    const utilizadores = await this.utilizadoresService.listarUtilizadores();

    this.anuncios = anuncios
      .filter(anuncio => (anuncio.estadoAnuncio || 'ativo') === 'ativo')
      .map(anuncio => ({
        ...anuncio,
        vendedor: utilizadores.find(utilizador => utilizador.id === anuncio.vendedorId)
      }));

    this.aplicarFiltros();
  }

  // Aplica todos os filtros ativos + texto de pesquisa à lista completa
  private aplicarFiltros(): void {
    let resultado = this.anuncios.filter(anuncio =>
      (anuncio.estadoAnuncio || 'ativo') === 'ativo'
    );

    // Filtro de texto
    if (this.termoPesquisa.trim()) {
      const termo = this.termoPesquisa.toLowerCase();

      resultado = resultado.filter(anuncio =>
        anuncio.titulo.toLowerCase().includes(termo) ||
        anuncio.descricao.toLowerCase().includes(termo) ||
        anuncio.estadoConservacao.toLowerCase().includes(termo) ||
        anuncio.localizacao.toLowerCase().includes(termo) ||
        this.obterTextoTipo(anuncio).toLowerCase().includes(termo) ||
        anuncio.vendedor?.nome.toLowerCase().includes(termo) ||
        anuncio.vendedor?.username.toLowerCase().includes(termo)
      );
    }

    // Filtro por tipo de anúncio
    if (this.filtroTipo) {
      resultado = resultado.filter(anuncio => anuncio.tipo === this.filtroTipo);
    }

    // Filtro por estado de conservação
    if (this.filtroEstado) {
      resultado = resultado.filter(anuncio => anuncio.estadoConservacao === this.filtroEstado);
    }

    // Filtro por ano/período
    if (this.filtroAno) {
      resultado = resultado.filter(anuncio => {
        const ano = anuncio.ano || parseInt(anuncio.dataPublicacao?.substring(0, 4) || '0', 10);

        if (this.filtroAno === 'antes1950') {
          return ano > 0 && ano < 1950;
        }

        if (this.filtroAno === '1950-1999') {
          return ano >= 1950 && ano <= 1999;
        }

        if (this.filtroAno === '2000+') {
          return ano >= 2000;
        }

        return true;
      });
    }

    // Ordenação por preço
    if (this.filtroPreco === 'asc') {
      resultado.sort((a, b) => a.preco - b.preco);
    } else if (this.filtroPreco === 'desc') {
      resultado.sort((a, b) => b.preco - a.preco);
    }

    this.anunciosFiltrados = resultado;
  }

  // Chamado quando o utilizador escreve na barra de pesquisa
  public pesquisar(event: any): void {
    this.termoPesquisa = event.detail.value || '';
    this.aplicarFiltros();
  }

  // Limpa a pesquisa e todos os filtros ativos
  public limparTudo(): void {
    this.termoPesquisa = '';
    this.filtroTipo = null;
    this.filtroEstado = null;
    this.filtroPreco = null;
    this.filtroAno = null;
    this.aplicarFiltros();
  }

  // Abre o seletor do filtro "Tipo"
  public async abrirFiltroTipo(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Tipo de anúncio',
      buttons: [
        {
          text: 'Todos os tipos',
          icon: this.filtroTipo === null ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroTipo = null;
            this.aplicarFiltros();
          }
        },
        {
          text: 'Venda',
          icon: this.filtroTipo === 'venda' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroTipo = 'venda';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Troca',
          icon: this.filtroTipo === 'troca' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroTipo = 'troca';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await sheet.present();
  }

  // Abre o seletor do filtro "Estado de conservação"
  public async abrirFiltroEstado(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Estado de conservação',
      buttons: [
        {
          text: 'Todos os estados',
          icon: this.filtroEstado === null ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroEstado = null;
            this.aplicarFiltros();
          }
        },
        {
          text: 'Excelente',
          icon: this.filtroEstado === 'Excelente' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroEstado = 'Excelente';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Muito Bom',
          icon: this.filtroEstado === 'Muito Bom' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroEstado = 'Muito Bom';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Bom',
          icon: this.filtroEstado === 'Bom' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroEstado = 'Bom';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Razoável',
          icon: this.filtroEstado === 'Razoável' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroEstado = 'Razoável';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await sheet.present();
  }

  // Abre o seletor do filtro "Preço"
  public async abrirFiltroPreco(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Ordenar por preço',
      buttons: [
        {
          text: 'Sem ordenação',
          icon: this.filtroPreco === null ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroPreco = null;
            this.aplicarFiltros();
          }
        },
        {
          text: 'Preço: mais barato primeiro',
          icon: this.filtroPreco === 'asc' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroPreco = 'asc';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Preço: mais caro primeiro',
          icon: this.filtroPreco === 'desc' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroPreco = 'desc';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await sheet.present();
  }

  // Abre o seletor do filtro "Ano"
  public async abrirFiltroAno(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: 'Período da moeda',
      buttons: [
        {
          text: 'Todos os anos',
          icon: this.filtroAno === null ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroAno = null;
            this.aplicarFiltros();
          }
        },
        {
          text: 'Antigas (antes de 1950)',
          icon: this.filtroAno === 'antes1950' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroAno = 'antes1950';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Século XX (1950 – 1999)',
          icon: this.filtroAno === '1950-1999' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroAno = '1950-1999';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Modernas (2000 em diante)',
          icon: this.filtroAno === '2000+' ? 'checkmark-outline' : '',
          handler: () => {
            this.filtroAno = '2000+';
            this.aplicarFiltros();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await sheet.present();
  }

  public abrirDetalhe(anuncioId: number): void {
    this.router.navigateByUrl(`/detalhe-anuncio/${anuncioId}`);
  }

  public async alternarFavorito(event: Event, anuncioId: number): Promise<void> {
    event.stopPropagation();

    await this.anunciosService.alternarFavorito(anuncioId);
    await this.carregarAnuncios();
  }

  public abrirAjuda(): void {
    this.router.navigateByUrl('/ajuda');
  }

  // Devolve true se algum filtro estiver ativo
  public temFiltrosAtivos(): boolean {
    return !!(this.filtroTipo || this.filtroEstado || this.filtroPreco || this.filtroAno);
  }

  public formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public obterImagemPrincipal(anuncio: Anuncio): string {
    return anuncio.imagens && anuncio.imagens.length > 0
      ? anuncio.imagens[0]
      : 'assets/img/moedas/moeda-ouro.png';
  }

  public obterTextoTipo(anuncio: Anuncio): string {
    return anuncio.tipo === 'venda' ? 'Venda' : 'Troca';
  }

  public obterTextoVendasVendedor(anuncio: AnuncioCard): string {
    const vendas = anuncio.vendedor?.vendasConcluidas || 0;

    if (vendas === 1) {
      return '1 venda concluída';
    }

    return `${vendas} vendas concluídas`;
  }

  // Devolve o texto a mostrar no chip do filtro tipo
  public textoFiltroTipo(): string {
    if (!this.filtroTipo) {
      return 'Tipo';
    }

    if (this.filtroTipo === 'venda') {
      return 'Venda';
    }

    return 'Troca';
  }

  // Devolve o texto a mostrar no chip do filtro ano
  public textoFiltroAno(): string {
    if (!this.filtroAno) {
      return 'Ano';
    }

    if (this.filtroAno === 'antes1950') {
      return '< 1950';
    }

    if (this.filtroAno === '1950-1999') {
      return '1950–1999';
    }

    return '2000+';
  }
}