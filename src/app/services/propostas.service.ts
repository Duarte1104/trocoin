import { Injectable } from '@angular/core';

import { Proposta } from '../models/proposta';
import { Anuncio } from '../models/anuncio';

import { StorageService } from './storage.service';
import { MensagensService } from './mensagens.service';
import { AnunciosService } from './anuncios.service';
import { UtilizadoresService } from './utilizadores.service';

@Injectable({
  providedIn: 'root'
})
export class PropostasService {
  private CHAVE_PROPOSTAS = 'trocoin_propostas';

  constructor(
    private storageService: StorageService,
    private mensagensService: MensagensService,
    private anunciosService: AnunciosService,
    private utilizadoresService: UtilizadoresService
  ) {}

  public async listarPropostas(): Promise<Proposta[]> {
    return await this.storageService.obter<Proposta[]>(this.CHAVE_PROPOSTAS) || [];
  }

  public async listarPropostasPorConversa(conversaId: number): Promise<Proposta[]> {
    const propostas = await this.listarPropostas();

    return propostas
      .filter(proposta => proposta.conversaId === conversaId)
      .sort((a, b) => b.id - a.id);
  }

  public async criarPropostaCompra(
    anuncio: Anuncio,
    compradorId: number,
    valorProposto: number,
    mensagem?: string
  ): Promise<Proposta | null> {
    if (anuncio.tipo !== 'venda') {
      return null;
    }

    if (anuncio.vendedorId === compradorId) {
      return null;
    }

    if ((anuncio.estadoAnuncio || 'ativo') !== 'ativo') {
      return null;
    }

    if (valorProposto <= 0 || valorProposto > anuncio.preco) {
      return null;
    }

    const conversa = await this.mensagensService.criarConversa(
      anuncio.id,
      compradorId,
      anuncio.vendedorId
    );

    const propostasExistentes = await this.listarPropostas();

    const existePropostaEmAberto = propostasExistentes.some(proposta =>
      proposta.conversaId === conversa.id &&
      (
        proposta.estado === 'pendente' ||
        proposta.estado === 'aceite' ||
        proposta.estado === 'paga'
      )
    );

    if (existePropostaEmAberto) {
      return null;
    }

    const agora = new Date().toISOString();

    const proposta: Proposta = {
      id: Date.now(),
      conversaId: conversa.id,
      anuncioId: anuncio.id,
      compradorId,
      vendedorId: anuncio.vendedorId,
      tipo: 'compra',
      valorProposto,
      mensagem,
      estado: 'pendente',
      dataCriacao: agora,
      dataAtualizacao: agora
    };

    propostasExistentes.push(proposta);

    await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostasExistentes);

    await this.mensagensService.enviarMensagem(
      conversa.id,
      anuncio.id,
      compradorId,
      `Proposta de compra enviada: ${this.formatarPreco(valorProposto)}${mensagem ? ' — ' + mensagem : ''}`,
      'proposta-compra',
      proposta.id
    );

    await this.mensagensService.atualizarEstadoConversa(conversa.id, 'aguarda-resposta');

    return proposta;
  }

  public async criarPropostaTroca(
    anuncioPretendido: Anuncio,
    anuncioOferecido: Anuncio,
    compradorId: number,
    valorExtraOferecido: number,
    mensagem?: string
  ): Promise<Proposta | null> {
    if (anuncioPretendido.tipo !== 'troca') {
      return null;
    }

    if (anuncioPretendido.vendedorId === compradorId) {
      return null;
    }

    if (anuncioOferecido.vendedorId !== compradorId) {
      return null;
    }

    if ((anuncioPretendido.estadoAnuncio || 'ativo') !== 'ativo') {
      return null;
    }

    if ((anuncioOferecido.estadoAnuncio || 'ativo') !== 'ativo') {
      return null;
    }

    if (anuncioPretendido.id === anuncioOferecido.id) {
      return null;
    }

    const conversa = await this.mensagensService.criarConversa(
      anuncioPretendido.id,
      compradorId,
      anuncioPretendido.vendedorId
    );

    const propostasExistentes = await this.listarPropostas();

    const existePropostaEmAberto = propostasExistentes.some(proposta =>
      proposta.conversaId === conversa.id &&
      (
        proposta.estado === 'pendente' ||
        proposta.estado === 'aceite' ||
        proposta.estado === 'paga'
      )
    );

    if (existePropostaEmAberto) {
      return null;
    }

    const agora = new Date().toISOString();

    const proposta: Proposta = {
      id: Date.now(),
      conversaId: conversa.id,
      anuncioId: anuncioPretendido.id,
      compradorId,
      vendedorId: anuncioPretendido.vendedorId,
      tipo: 'troca',
      anuncioTrocaId: anuncioOferecido.id,
      tituloAnuncioTroca: anuncioOferecido.titulo,
      valorExtraOferecido: valorExtraOferecido || 0,
      mensagem,
      estado: 'pendente',
      dataCriacao: agora,
      dataAtualizacao: agora
    };

    propostasExistentes.push(proposta);

    await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostasExistentes);

    const texto =
      `Proposta de troca enviada: ofereço "${anuncioOferecido.titulo}"` +
      `${valorExtraOferecido > 0 ? ' + ' + this.formatarPreco(valorExtraOferecido) : ''}` +
      `${mensagem ? ' — ' + mensagem : ''}`;

    await this.mensagensService.enviarMensagem(
      conversa.id,
      anuncioPretendido.id,
      compradorId,
      texto,
      'proposta-troca',
      proposta.id
    );

    await this.mensagensService.atualizarEstadoConversa(conversa.id, 'aguarda-resposta');

    return proposta;
  }

  public async aceitarProposta(propostaId: number, utilizadorAtualId: number): Promise<boolean> {
    const propostas = await this.listarPropostas();
    const indice = propostas.findIndex(proposta => proposta.id === propostaId);

    if (indice === -1) {
      return false;
    }

    const proposta = propostas[indice];

    if (proposta.vendedorId !== utilizadorAtualId || proposta.estado !== 'pendente') {
      return false;
    }

    if (proposta.tipo === 'compra') {
      propostas[indice] = {
        ...proposta,
        estado: 'aceite',
        dataAtualizacao: new Date().toISOString()
      };

      await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostas);

      await this.mensagensService.enviarMensagem(
        proposta.conversaId,
        proposta.anuncioId,
        utilizadorAtualId,
        'Proposta aceite. Aguarda-se o pagamento do comprador.',
        'proposta-aceite',
        proposta.id
      );

      await this.mensagensService.atualizarEstadoConversa(
        proposta.conversaId,
        'aguarda-pagamento'
      );

      return true;
    }

    if (proposta.tipo === 'troca') {
  if (!proposta.anuncioTrocaId) {
    return false;
  }

  const anuncioPretendido = await this.anunciosService.obterAnuncioPorId(proposta.anuncioId);
  const anuncioOferecido = await this.anunciosService.obterAnuncioPorId(proposta.anuncioTrocaId);

  if (!anuncioPretendido || !anuncioOferecido) {
    return false;
  }

  propostas[indice] = {
    ...proposta,
    estado: 'concluida',
    dataAtualizacao: new Date().toISOString()
  };

  await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostas);

  await this.anunciosService.atualizarAnuncio({
    ...anuncioPretendido,
    estadoAnuncio: 'trocado',
    compradorId: proposta.compradorId,
    dataConclusao: new Date().toISOString()
  });

  await this.anunciosService.atualizarAnuncio({
    ...anuncioOferecido,
    estadoAnuncio: 'trocado',
    compradorId: proposta.vendedorId,
    dataConclusao: new Date().toISOString()
  });

  if (proposta.valorExtraOferecido && proposta.valorExtraOferecido > 0) {
    await this.utilizadoresService.adicionarSaldo(
      proposta.vendedorId,
      proposta.valorExtraOferecido
    );
  }

  const textoTroca =
    `Proposta de troca aceite. As duas moedas deixam de estar disponíveis na pesquisa.` +
    `${proposta.valorExtraOferecido && proposta.valorExtraOferecido > 0
      ? ' Foi adicionado ao saldo do vendedor o valor extra de ' + this.formatarPreco(proposta.valorExtraOferecido) + '.'
      : ''
    } Agora devem combinar o local de entrega.`;

  await this.mensagensService.enviarMensagem(
    proposta.conversaId,
    proposta.anuncioId,
    utilizadorAtualId,
    textoTroca,
    'negocio-concluido',
    proposta.id
  );

  await this.mensagensService.atualizarEstadoConversa(
    proposta.conversaId,
    'concluida'
  );

  return true;
}

    return false;
  }

  public async recusarProposta(propostaId: number, utilizadorAtualId: number): Promise<boolean> {
    const propostas = await this.listarPropostas();
    const indice = propostas.findIndex(proposta => proposta.id === propostaId);

    if (indice === -1) {
      return false;
    }

    const proposta = propostas[indice];

    if (proposta.vendedorId !== utilizadorAtualId || proposta.estado !== 'pendente') {
      return false;
    }

    propostas[indice] = {
      ...proposta,
      estado: 'recusada',
      dataAtualizacao: new Date().toISOString()
    };

    await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostas);

    await this.mensagensService.enviarMensagem(
      proposta.conversaId,
      proposta.anuncioId,
      utilizadorAtualId,
      'Proposta recusada. O comprador pode enviar uma nova proposta.',
      'proposta-recusada',
      proposta.id
    );

    await this.mensagensService.atualizarEstadoConversa(
      proposta.conversaId,
      'proposta-recusada'
    );

    return true;
  }

  public async efetuarPagamento(propostaId: number, utilizadorAtualId: number): Promise<boolean> {
    const propostas = await this.listarPropostas();
    const indice = propostas.findIndex(proposta => proposta.id === propostaId);

    if (indice === -1) {
      return false;
    }

    const proposta = propostas[indice];

    if (
      proposta.compradorId !== utilizadorAtualId ||
      proposta.estado !== 'aceite' ||
      proposta.tipo !== 'compra' ||
      !proposta.valorProposto
    ) {
      return false;
    }

    propostas[indice] = {
      ...proposta,
      estado: 'paga',
      dataAtualizacao: new Date().toISOString()
    };

    await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostas);

    await this.anunciosService.marcarComoVendido(
      proposta.anuncioId,
      proposta.compradorId,
      proposta.valorProposto
    );

    await this.utilizadoresService.concluirVenda(
      proposta.vendedorId,
      proposta.valorProposto
    );

    await this.mensagensService.enviarMensagem(
      proposta.conversaId,
      proposta.anuncioId,
      utilizadorAtualId,
      `Pagamento efetuado com sucesso: ${this.formatarPreco(proposta.valorProposto)}. Agora comprador e vendedor devem combinar o local de entrega.`,
      'pagamento-efetuado',
      proposta.id
    );

    await this.mensagensService.atualizarEstadoConversa(
      proposta.conversaId,
      'pagamento-efetuado'
    );

    return true;
  }

  private formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(preco);
  }

  public async removerPropostasPorAnuncio(anuncioId: number): Promise<void> {
  const propostas = await this.listarPropostas();

  const propostasAtualizadas = propostas.filter(proposta =>
    proposta.anuncioId !== anuncioId &&
    proposta.anuncioTrocaId !== anuncioId
  );

  await this.storageService.guardar(this.CHAVE_PROPOSTAS, propostasAtualizadas);
}
}