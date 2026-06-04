import { Injectable } from '@angular/core';

import { Conversa, EstadoConversa } from '../models/conversa';
import { Mensagem, TipoMensagem } from '../models/mensagem';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MensagensService {
  private CHAVE_CONVERSAS = 'trocoin_conversas_criadas';
  private CHAVE_MENSAGENS = 'trocoin_mensagens_criadas';

  constructor(
    private storageService: StorageService
  ) {}

  public async listarConversas(): Promise<Conversa[]> {
    return await this.storageService.obter<Conversa[]>(this.CHAVE_CONVERSAS) || [];
  }

  public async obterConversaPorId(id: number): Promise<Conversa | undefined> {
    const conversas = await this.listarConversas();
    return conversas.find(conversa => conversa.id === id);
  }

  public async listarConversasDoUtilizador(utilizadorId: number): Promise<Conversa[]> {
    const conversas = await this.listarConversas();

    return conversas
      .filter(conversa =>
        conversa.compradorId === utilizadorId ||
        conversa.vendedorId === utilizadorId
      )
      .sort((a, b) => b.id - a.id);
  }

  public async listarMensagensPorConversa(conversaId: number): Promise<Mensagem[]> {
    const mensagens = await this.storageService.obter<Mensagem[]>(this.CHAVE_MENSAGENS) || [];

    return mensagens
      .filter(mensagem => mensagem.conversaId === conversaId)
      .sort((a, b) => a.id - b.id);
  }

  public async criarConversa(
    anuncioId: number,
    compradorId: number,
    vendedorId: number
  ): Promise<Conversa> {
    const conversas = await this.listarConversas();

    const existente = conversas.find(conversa =>
      conversa.anuncioId === anuncioId &&
      conversa.compradorId === compradorId &&
      conversa.vendedorId === vendedorId
    );

    if (existente) {
      return existente;
    }

    const agora = new Date().toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const novaConversa: Conversa = {
      id: Date.now(),
      anuncioId,
      compradorId,
      vendedorId,
      ultimaMensagem: 'Conversa iniciada',
      dataUltimaMensagem: agora,
      mensagensNaoLidas: 0,
      estado: 'ativa'
    };

    conversas.push(novaConversa);

    await this.storageService.guardar(this.CHAVE_CONVERSAS, conversas);

    return novaConversa;
  }

  public async enviarMensagem(
    conversaId: number,
    anuncioId: number,
    remetenteId: number,
    texto: string,
    tipo: TipoMensagem = 'texto',
    propostaId?: number
  ): Promise<Mensagem> {
    const mensagens = await this.storageService.obter<Mensagem[]>(this.CHAVE_MENSAGENS) || [];

    const novaMensagem: Mensagem = {
      id: Date.now(),
      conversaId,
      anuncioId,
      remetenteId,
      texto,
      data: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      tipo,
      propostaId
    };

    mensagens.push(novaMensagem);

    await this.storageService.guardar(this.CHAVE_MENSAGENS, mensagens);
    await this.atualizarUltimaMensagem(conversaId, texto);

    return novaMensagem;
  }

  public async atualizarEstadoConversa(
    conversaId: number,
    estado: EstadoConversa
  ): Promise<void> {
    const conversas = await this.listarConversas();
    const indice = conversas.findIndex(conversa => conversa.id === conversaId);

    if (indice === -1) {
      return;
    }

    conversas[indice] = {
      ...conversas[indice],
      estado,
      dataUltimaMensagem: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    await this.storageService.guardar(this.CHAVE_CONVERSAS, conversas);
  }

  private async atualizarUltimaMensagem(conversaId: number, texto: string): Promise<void> {
    const conversas = await this.listarConversas();
    const indice = conversas.findIndex(conversa => conversa.id === conversaId);

    if (indice === -1) {
      return;
    }

    conversas[indice] = {
      ...conversas[indice],
      ultimaMensagem: texto.length > 65 ? texto.substring(0, 65) + '...' : texto,
      dataUltimaMensagem: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    await this.storageService.guardar(this.CHAVE_CONVERSAS, conversas);
  }
}