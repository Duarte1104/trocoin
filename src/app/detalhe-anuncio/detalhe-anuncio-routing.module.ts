import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalheAnuncioPage } from './detalhe-anuncio.page';

const routes: Routes = [
  {
    path: '',
    component: DetalheAnuncioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalheAnuncioPageRoutingModule {}
