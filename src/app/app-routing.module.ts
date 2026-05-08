import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'criar-conta',
    loadChildren: () =>
      import('./criar-conta/criar-conta.module').then(m => m.CriarContaPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'ajuda',
    loadChildren: () =>
      import('./ajuda/ajuda.module').then(m => m.AjudaPageModule)
  },
  {
    path: 'detalhe-anuncio/:id',
    loadChildren: () =>
      import('./detalhe-anuncio/detalhe-anuncio.module').then(m => m.DetalheAnuncioPageModule)
  },
  {
    path: 'conversa/:id',
    loadChildren: () =>
      import('./conversa/conversa.module').then(m => m.ConversaPageModule)
  },
  {
    path: 'propor-troca/:id',
    loadChildren: () =>
      import('./propor-troca/propor-troca.module').then(m => m.ProporTrocaPageModule)
  },
  {
    path: 'propor-compra/:id',
    loadChildren: () =>
      import('./propor-compra/propor-compra.module').then(m => m.ProporCompraPageModule)
  },
  {
    path: 'anuncio-publicado/:id',
    loadChildren: () =>
      import('./anuncio-publicado/anuncio-publicado.module').then(m => m.AnuncioPublicadoPageModule)
  },
  {
    path: 'confirmacao-troca/:id',
    loadChildren: () =>
      import('./confirmacao-troca/confirmacao-troca.module').then(m => m.ConfirmacaoTrocaPageModule)
  },
  {
    path: 'compra-realizada/:id',
    loadChildren: () =>
      import('./compra-realizada/compra-realizada.module').then(m => m.CompraRealizadaPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}