import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnuncioPublicadoPage } from './anuncio-publicado.page';

const routes: Routes = [
  {
    path: '',
    component: AnuncioPublicadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnuncioPublicadoPageRoutingModule {}
