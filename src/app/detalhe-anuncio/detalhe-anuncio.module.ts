import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalheAnuncioPageRoutingModule } from './detalhe-anuncio-routing.module';

import { DetalheAnuncioPage } from './detalhe-anuncio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalheAnuncioPageRoutingModule
  ],
  declarations: [DetalheAnuncioPage]
})
export class DetalheAnuncioPageModule {}
