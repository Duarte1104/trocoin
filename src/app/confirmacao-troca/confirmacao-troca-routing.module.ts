import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmacaoTrocaPage } from './confirmacao-troca.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmacaoTrocaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmacaoTrocaPageRoutingModule {}
