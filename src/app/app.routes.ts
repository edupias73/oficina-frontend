import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { ClientesComponent } from './pages/clientes/clientes';
import { authGuard } from './core/guards/auth-guard';
import { VeiculosComponent } from './pages/veiculos/veiculos';
import { OrdensServicoComponent } from './pages/ordens-servico/ordens-servico';
import { ProdutosComponent } from './pages/produtos/produtos';
import { Mecanicos } from './pages/mecanicos/mecanicos';
import { Usuarios } from './pages/usuarios/usuarios';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      
      { path: 'home', component: Home },
      { path: 'clientes', component: ClientesComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'os', component: OrdensServicoComponent },
      { path: 'produtos', component: ProdutosComponent },
      { path: 'mecanicos', component: Mecanicos },
      { path: 'usuarios', component: Usuarios },
    ],
  },

  { path: '**', redirectTo: 'login' },
];