import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'criar-conta',
    loadChildren: () => import('./criar-conta/criar-conta.module').then( m => m.CriarContaPageModule)
  },
  {
    path: 'pesquisar',
    loadChildren: () => import('./pesquisar/pesquisar.module').then( m => m.PesquisarPageModule)
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'novo-anuncio',
    loadChildren: () => import('./novo-anuncio/novo-anuncio.module').then( m => m.NovoAnuncioPageModule)
  },
  {
    path: 'mensagens',
    loadChildren: () => import('./mensagens/mensagens.module').then( m => m.MensagensPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'ajuda',
    loadChildren: () => import('./ajuda/ajuda.module').then( m => m.AjudaPageModule)
  },
  {
    path: 'detalhe-anuncio',
    loadChildren: () => import('./detalhe-anuncio/detalhe-anuncio.module').then( m => m.DetalheAnuncioPageModule)
  },
  {
    path: 'conversa',
    loadChildren: () => import('./conversa/conversa.module').then( m => m.ConversaPageModule)
  },
  {
    path: 'propor-troca',
    loadChildren: () => import('./propor-troca/propor-troca.module').then( m => m.ProporTrocaPageModule)
  },
  {
    path: 'propor-compra',
    loadChildren: () => import('./propor-compra/propor-compra.module').then( m => m.ProporCompraPageModule)
  },
  {
    path: 'anuncio-publicado',
    loadChildren: () => import('./anuncio-publicado/anuncio-publicado.module').then( m => m.AnuncioPublicadoPageModule)
  },
  {
    path: 'confirmacao-troca',
    loadChildren: () => import('./confirmacao-troca/confirmacao-troca.module').then( m => m.ConfirmacaoTrocaPageModule)
  },
  {
    path: 'compra-realizada',
    loadChildren: () => import('./compra-realizada/compra-realizada.module').then( m => m.CompraRealizadaPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
