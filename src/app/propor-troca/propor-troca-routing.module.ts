import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProporTrocaPage } from './propor-troca.page';

const routes: Routes = [
  {
    path: '',
    component: ProporTrocaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProporTrocaPageRoutingModule {}
