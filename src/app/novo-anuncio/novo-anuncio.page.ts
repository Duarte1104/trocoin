import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastController } from '@ionic/angular';

import { AnunciosService } from '../services/anuncios.service';
import { Anuncio } from '../models/anuncio';

@Component({
  selector: 'app-novo-anuncio',
  templateUrl: './novo-anuncio.page.html',
  styleUrls: ['./novo-anuncio.page.scss'],
  standalone: false
})
export class NovoAnuncioPage {
  public titulo = '';
  public descricao = '';
  public preco: number | null = null;
  public tipo: 'venda' | 'troca' | 'venda-troca' = 'venda';
  public estadoConservacao = 'Bom';
  public localizacao = 'Viana do Castelo, Portugal';
  public imagemSelecionada = '';

  constructor(
    private router: Router,
    private anunciosService: AnunciosService,
    private toastController: ToastController
  ) {}

  // Abre a câmara/galeria através do Capacitor. Será mais útil no telemóvel físico.
  public async escolherImagem(): Promise<void> {
    try {
      const imagem = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (imagem.dataUrl) {
        this.imagemSelecionada = imagem.dataUrl;
      }
    } catch (erro) {
      await this.mostrarMensagem('No browser, usa a opção "Escolher do computador".');
    }
  }

  // Abre o seletor de ficheiros no browser
  public abrirSeletorFicheiro(input: HTMLInputElement): void {
    input.click();
  }

  // Lê a imagem escolhida no computador e converte para base64
  public selecionarImagemFicheiro(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const ficheiro = input.files[0];
    const leitor = new FileReader();

    leitor.onload = () => {
      this.imagemSelecionada = leitor.result as string;
    };

    leitor.readAsDataURL(ficheiro);
  }

  private formularioValido(): boolean {
    return !!(
      this.titulo.trim() &&
      this.descricao.trim() &&
      this.preco &&
      this.estadoConservacao &&
      this.localizacao.trim() &&
      this.imagemSelecionada
    );
  }

  public async publicarAnuncio(): Promise<void> {
    if (!this.formularioValido()) {
      await this.mostrarMensagem('Preenche todos os campos e adiciona uma foto.');
      return;
    }

    const novoAnuncio: Omit<Anuncio, 'id' | 'dataPublicacao'> = {
      moedaId: 0,
      titulo: this.titulo,
      descricao: this.descricao,
      preco: Number(this.preco),
      tipo: this.tipo,
      estadoConservacao: this.estadoConservacao,
      localizacao: this.localizacao,
      vendedorId: 1,
      imagens: [this.imagemSelecionada],
      favorito: false,
      publicadoPeloUtilizador: true
    };

    const anuncioCriado = await this.anunciosService.criarAnuncio(novoAnuncio);

    await this.mostrarMensagem('Anúncio publicado com sucesso!');
    this.router.navigateByUrl(`/anuncio-publicado/${anuncioCriado.id}`);
  }

  public limparFormulario(): void {
    this.titulo = '';
    this.descricao = '';
    this.preco = null;
    this.tipo = 'venda';
    this.estadoConservacao = 'Bom';
    this.localizacao = 'Viana do Castelo, Portugal';
    this.imagemSelecionada = '';
  }

  private async mostrarMensagem(mensagem: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1800,
      position: 'bottom',
      color: 'dark'
    });

    await toast.present();
  }
}