import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NovoAnuncioPage } from './novo-anuncio.page';

const routes: Routes = [
  {
    path: '',
    component: NovoAnuncioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NovoAnuncioPageRoutingModule {}
