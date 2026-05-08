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

  private chaveConversasCriadas = 'trocoin_conversas_criadas';
  private chaveMensagensCriadas = 'trocoin_mensagens_criadas';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public async listarConversas(): Promise<Conversa[]> {
    const conversasJson = await firstValueFrom(this.http.get<Conversa[]>(this.caminhoConversasJson));
    const conversasCriadas = await this.storageService.obter<Conversa[]>(this.chaveConversasCriadas) || [];

    return [...conversasJson, ...conversasCriadas];
  }

  public async obterConversaPorId(id: number): Promise<Conversa | undefined> {
    const conversas = await this.listarConversas();
    return conversas.find(conversa => conversa.id === id);
  }

  public async listarMensagensPorConversa(conversaId: number): Promise<Mensagem[]> {
    const mensagensJson = await firstValueFrom(this.http.get<Mensagem[]>(this.caminhoMensagensJson));
    const mensagensCriadas = await this.storageService.obter<Mensagem[]>(this.chaveMensagensCriadas) || [];

    return [...mensagensJson, ...mensagensCriadas]
      .filter(mensagem => mensagem.conversaId === conversaId);
  }

  public async enviarMensagem(
    conversaId: number,
    anuncioId: number,
    remetenteId: number,
    texto: string,
    tipo: 'texto' | 'proposta-compra' | 'proposta-troca' = 'texto'
  ): Promise<Mensagem> {
    const mensagensCriadas = await this.storageService.obter<Mensagem[]>(this.chaveMensagensCriadas) || [];

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
      tipo
    };

    mensagensCriadas.push(novaMensagem);

    await this.storageService.guardar(this.chaveMensagensCriadas, mensagensCriadas);

    return novaMensagem;
  }

  public async criarConversa(anuncioId: number, outroUtilizadorId: number): Promise<Conversa> {
    const conversas = await this.listarConversas();

    const conversaExistente = conversas.find(conversa =>
      conversa.anuncioId === anuncioId &&
      conversa.outroUtilizadorId === outroUtilizadorId
    );

    if (conversaExistente) {
      return conversaExistente;
    }

    const conversasCriadas = await this.storageService.obter<Conversa[]>(this.chaveConversasCriadas) || [];

    const novaConversa: Conversa = {
      id: Date.now(),
      anuncioId,
      utilizadorId: 1,
      outroUtilizadorId,
      ultimaMensagem: '',
      dataUltimaMensagem: '',
      mensagensNaoLidas: 0
    };

    conversasCriadas.push(novaConversa);

    await this.storageService.guardar(this.chaveConversasCriadas, conversasCriadas);

    return novaConversa;
  }
}