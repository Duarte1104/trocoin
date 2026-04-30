import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProporTrocaPageRoutingModule } from './propor-troca-routing.module';

import { ProporTrocaPage } from './propor-troca.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProporTrocaPageRoutingModule
  ],
  declarations: [ProporTrocaPage]
})
export class ProporTrocaPageModule {}
