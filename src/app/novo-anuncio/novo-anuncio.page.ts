import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastController } from '@ionic/angular';
import { AnunciosService } from '../services/anuncios.service';
import { UtilizadoresService } from '../services/utilizadores.service';
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
  public tipo: 'venda' | 'troca' = 'venda';
  public estadoConservacao = 'Bom';
  public localizacao = 'Viana do Castelo, Portugal';
  public imagemSelecionada = '';

  constructor(
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private toastController: ToastController
  ) {}

  // reseta o formulário sempre que a página fica visível (ex: ao voltar de anuncio-publicado)
  public ionViewWillEnter(): void {
    this.limparFormulario();
  }

  // Abre a câmara do telemóvel diretamente para tirar uma foto
  public async tirarFoto(): Promise<void> {
    try {
      const imagem = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      if (imagem.dataUrl) {
        this.imagemSelecionada = imagem.dataUrl;
      }
    } catch (erro) {
      await this.mostrarMensagem('Não foi possível abrir a câmara.', 'warning');
    }
  }

  // Abre a galeria do telemóvel para escolher uma foto existente
  public async escolherDaGaleria(): Promise<void> {
    try {
      const imagem = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      if (imagem.dataUrl) {
        this.imagemSelecionada = imagem.dataUrl;
      }
    } catch (erro) {
      // no browser não há galeria — usa o seletor de ficheiros
    }
  }

  // Abre o seletor de ficheiros nativo do browser (alternativa para quando não está no telemóvel)
  public abrirSeletorFicheiro(input: HTMLInputElement): void {
    input.click();
  }

  // Lê a imagem escolhida no seletor de ficheiros e converte para base64
  public selecionarImagemFicheiro(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      this.imagemSelecionada = leitor.result as string;
    };
    leitor.readAsDataURL(input.files[0]);
  }

  private formularioValido(): boolean {
    return !!(this.titulo.trim() && this.descricao.trim() && this.preco && this.imagemSelecionada);
  }

  public async publicarAnuncio(): Promise<void> {
    if (!this.formularioValido()) {
      await this.mostrarMensagem('Preenche todos os campos e adiciona uma foto.', 'warning');
      return;
    }

    const utilizadorId = await this.utilizadoresService.obterIdUtilizadorAtual();

    const novoAnuncio: Omit<Anuncio, 'id' | 'dataPublicacao'> = {
      moedaId: 0,
      titulo: this.titulo.trim(),
      descricao: this.descricao.trim(),
      preco: Number(this.preco),
      tipo: this.tipo,
      estadoConservacao: this.estadoConservacao,
      localizacao: this.localizacao.trim(),
      vendedorId: utilizadorId,
      imagens: [this.imagemSelecionada],
      favorito: false,
      publicadoPeloUtilizador: true
    };

    const criado = await this.anunciosService.criarAnuncio(novoAnuncio);
    await this.mostrarMensagem('Anúncio publicado com sucesso!', 'success');

    // limpar o formulário ANTES de navegar para que ao voltar esteja limpo
    this.limparFormulario();
    this.router.navigateByUrl(`/anuncio-publicado/${criado.id}`);
  }

  public limparFoto(): void {
    this.imagemSelecionada = '';
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

  private async mostrarMensagem(msg: string, cor: 'success' | 'warning' | 'dark' = 'dark'): Promise<void> {
    const toast = await this.toastController.create({
      message: msg, duration: 1800, position: 'bottom', color: cor
    });
    await toast.present();
  }
}

// remove a foto selecionada
