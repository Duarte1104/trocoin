import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnuncioPublicadoPageRoutingModule } from './anuncio-publicado-routing.module';

import { AnuncioPublicadoPage } from './anuncio-publicado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnuncioPublicadoPageRoutingModule
  ],
  declarations: [AnuncioPublicadoPage]
})
export class AnuncioPublicadoPageModule {}
