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
  /** Título do anúncio a publicar */
  public titulo = '';

  /** Descrição detalhada da moeda */
  public descricao = '';

  /** Preço pedido pelo utilizador */
  public preco: number | null = null;

  /** Tipo de transação aceite */
  public tipo: 'venda' | 'troca' | 'venda-troca' = 'venda';

  /** Estado de conservação da moeda */
  public estadoConservacao = 'Bom';

  /** Localização do vendedor */
  public localizacao = 'Viana do Castelo, Portugal';

  /** Imagem selecionada em base64 */
  public imagemSelecionada = '';

  constructor(
    private router: Router,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService,
    private toastController: ToastController
  ) {}

  /**
   * Abre a câmara ou galeria do dispositivo através do Capacitor.
   * No browser, solicita ao utilizador que use o seletor de ficheiros.
   */
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
      await this.mostrarMensagem('Usa o botão "Escolher imagem" para selecionar uma foto.', 'warning');
    }
  }

  /** Abre o seletor de ficheiros nativo do browser */
  public abrirSeletorFicheiro(input: HTMLInputElement): void {
    input.click();
  }

  /**
   * Lê a imagem escolhida no seletor de ficheiros e converte para base64
   * para poder ser guardada no Ionic Storage.
   */
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

  /** Verifica se todos os campos obrigatórios estão preenchidos */
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

  /**
   * Publica o anúncio após validar o formulário.
   * Usa o ID do utilizador com sessão ativa como vendedorId.
   * Redireciona para a página de confirmação após publicar.
   */
  public async publicarAnuncio(): Promise<void> {
    if (!this.formularioValido()) {
      await this.mostrarMensagem('Preenche todos os campos e adiciona uma foto.', 'warning');
      return;
    }

    // Obter o ID do utilizador com sessão ativa
    const utilizadorAtualId = await this.utilizadoresService.obterIdUtilizadorAtual();

    const novoAnuncio: Omit<Anuncio, 'id' | 'dataPublicacao'> = {
      moedaId: 0,
      titulo: this.titulo,
      descricao: this.descricao,
      preco: Number(this.preco),
      tipo: this.tipo,
      estadoConservacao: this.estadoConservacao,
      localizacao: this.localizacao,
      vendedorId: utilizadorAtualId,
      imagens: [this.imagemSelecionada],
      favorito: false,
      publicadoPeloUtilizador: true
    };

    const anuncioCriado = await this.anunciosService.criarAnuncio(novoAnuncio);

    await this.mostrarMensagem('Anúncio publicado com sucesso!', 'success');
    this.router.navigateByUrl(`/anuncio-publicado/${anuncioCriado.id}`);
  }

  /** Limpa todos os campos do formulário */
  public limparFormulario(): void {
    this.titulo = '';
    this.descricao = '';
    this.preco = null;
    this.tipo = 'venda';
    this.estadoConservacao = 'Bom';
    this.localizacao = 'Viana do Castelo, Portugal';
    this.imagemSelecionada = '';
  }

  /** Mostra uma mensagem toast com a cor adequada */
  private async mostrarMensagem(mensagem: string, cor: 'success' | 'warning' | 'dark' = 'dark'): Promise<void> {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1800,
      position: 'bottom',
      color: cor
    });
    await toast.present();
  }
}
