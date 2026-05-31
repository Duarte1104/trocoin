import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Conversa } from '../models/conversa';
import { Mensagem } from '../models/mensagem';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MensagensService {

  private caminhoConversasJson = 'assets/data/conversas.json';
  private caminhoMensagensJson = 'assets/data/mensagens.json';

  private CHAVE_CONVERSAS = 'trocoin_conversas_criadas';
  private CHAVE_MENSAGENS = 'trocoin_mensagens_criadas';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  async listarConversas(): Promise<Conversa[]> {
    const doJson = await firstValueFrom(this.http.get<Conversa[]>(this.caminhoConversasJson));
    const criadas = await this.storageService.obter<Conversa[]>(this.CHAVE_CONVERSAS) || [];
    return [...doJson, ...criadas];
  }

  async obterConversaPorId(id: number): Promise<Conversa | undefined> {
    const lista = await this.listarConversas();
    return lista.find(c => c.id === id);
  }

  // devolve conversas do utilizador atual (como comprador ou vendedor)
  async listarConversasDoUtilizador(utilizadorId: number): Promise<Conversa[]> {
    const todas = await this.listarConversas();
    return todas.filter(c =>
      c.utilizadorId === utilizadorId || c.outroUtilizadorId === utilizadorId
    );
  }

  async listarMensagensPorConversa(conversaId: number): Promise<Mensagem[]> {
    const doJson = await firstValueFrom(this.http.get<Mensagem[]>(this.caminhoMensagensJson));
    const criadas = await this.storageService.obter<Mensagem[]>(this.CHAVE_MENSAGENS) || [];

    return [...doJson, ...criadas]
      .filter(m => m.conversaId === conversaId)
      .sort((a, b) => a.id - b.id);
  }

  async enviarMensagem(
    conversaId: number,
    anuncioId: number,
    remetenteId: number,
    texto: string,
    tipo: 'texto' | 'proposta-compra' | 'proposta-troca' = 'texto'
  ): Promise<Mensagem> {
    const criadas = await this.storageService.obter<Mensagem[]>(this.CHAVE_MENSAGENS) || [];

    const nova: Mensagem = {
      id: Date.now(),
      conversaId,
      anuncioId,
      remetenteId,
      texto,
      data: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      tipo
    };

    criadas.push(nova);
    await this.storageService.guardar(this.CHAVE_MENSAGENS, criadas);

    // atualizar a última mensagem da conversa
    await this.atualizarUltimaMensagem(conversaId, texto);

    return nova;
  }

  // cria conversa se ainda não existir, usa o utilizadorId passado como argumento
  async criarConversa(anuncioId: number, outroUtilizadorId: number, utilizadorAtualId: number): Promise<Conversa> {
    const todas = await this.listarConversas();

    // verificar se já existe uma conversa entre estes dois utilizadores sobre este anúncio
    const existente = todas.find(c =>
      c.anuncioId === anuncioId && (
        (c.utilizadorId === utilizadorAtualId && c.outroUtilizadorId === outroUtilizadorId) ||
        (c.utilizadorId === outroUtilizadorId && c.outroUtilizadorId === utilizadorAtualId)
      )
    );

    if (existente) return existente;

    const criadas = await this.storageService.obter<Conversa[]>(this.CHAVE_CONVERSAS) || [];

    const nova: Conversa = {
      id: Date.now(),
      anuncioId,
      utilizadorId: utilizadorAtualId,
      outroUtilizadorId,
      ultimaMensagem: '',
      dataUltimaMensagem: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      mensagensNaoLidas: 0
    };

    criadas.push(nova);
    await this.storageService.guardar(this.CHAVE_CONVERSAS, criadas);
    return nova;
  }

  // atualiza o texto da última mensagem na conversa (para aparecer na listagem)
  private async atualizarUltimaMensagem(conversaId: number, texto: string): Promise<void> {
    const criadas = await this.storageService.obter<Conversa[]>(this.CHAVE_CONVERSAS) || [];
    const idx = criadas.findIndex(c => c.id === conversaId);

    if (idx !== -1) {
      criadas[idx].ultimaMensagem = texto.length > 50 ? texto.substring(0, 50) + '...' : texto;
      criadas[idx].dataUltimaMensagem = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
      await this.storageService.guardar(this.CHAVE_CONVERSAS, criadas);
    }
  }
}
