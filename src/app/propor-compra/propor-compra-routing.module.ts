import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProporCompraPage } from './propor-compra.page';

const routes: Routes = [
  {
    path: '',
    component: ProporCompraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProporCompraPageRoutingModule {}
