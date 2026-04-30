import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProporCompraPageRoutingModule } from './propor-compra-routing.module';

import { ProporCompraPage } from './propor-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProporCompraPageRoutingModule
  ],
  declarations: [ProporCompraPage]
})
export class ProporCompraPageModule {}
