import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storagePronto = false;

  constructor(private storage: Storage) {
    this.iniciarStorage();
  }

  private async iniciarStorage(): Promise<void> {
    await this.storage.create();
    this.storagePronto = true;
  }

  private async garantirStoragePronto(): Promise<void> {
    if (!this.storagePronto) {
      await this.iniciarStorage();
    }
  }

  public async guardar<T>(chave: string, valor: T): Promise<void> {
    await this.garantirStoragePronto();
    await this.storage.set(chave, valor);
  }

  public async obter<T>(chave: string): Promise<T | null> {
    await this.garantirStoragePronto();
    return await this.storage.get(chave);
  }

  public async remover(chave: string): Promise<void> {
    await this.garantirStoragePronto();
    await this.storage.remove(chave);
  }

  public async limparTudo(): Promise<void> {
    await this.garantirStoragePronto();
    await this.storage.clear();
  }
}