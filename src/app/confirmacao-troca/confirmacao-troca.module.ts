import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmacaoTrocaPageRoutingModule } from './confirmacao-troca-routing.module';

import { ConfirmacaoTrocaPage } from './confirmacao-troca.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmacaoTrocaPageRoutingModule
  ],
  declarations: [ConfirmacaoTrocaPage]
})
export class ConfirmacaoTrocaPageModule {}
