import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'pesquisar',
        loadChildren: () =>
          import('../pesquisar/pesquisar.module').then(m => m.PesquisarPageModule)
      },
      {
        path: 'favoritos',
        loadChildren: () =>
          import('../favoritos/favoritos.module').then(m => m.FavoritosPageModule)
      },
      {
        path: 'novo-anuncio',
        loadChildren: () =>
          import('../novo-anuncio/novo-anuncio.module').then(m => m.NovoAnuncioPageModule)
      },
      {
        path: 'mensagens',
        loadChildren: () =>
          import('../mensagens/mensagens.module').then(m => m.MensagensPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () =>
          import('../perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: '',
        redirectTo: 'pesquisar',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TabsPageRoutingModule {}