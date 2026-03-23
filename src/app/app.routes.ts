import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { ClientesComponent } from './pages/clientes/clientes';
import { authGuard } from './core/guards/auth-guard';
import { VeiculosComponent } from './pages/veiculos/veiculos';
import { OrdensServicoComponent } from './pages/ordens-servico/ordens-servico';
import { Produtos } from './pages/produtos/produtos';
import { Mecanicos } from './pages/mecanicos/mecanicos';
import { Usuarios } from './pages/usuarios/usuarios';

// 👇 AJUSTE O CAMINHO: Se o seu authGuard está em core/guards,
// coloque o adminGuard lá também para não dar erro de pasta!
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // 1º Nível: Tem que estar logado
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      { path: 'home', component: Home },
      { path: 'clientes', component: ClientesComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'os', component: OrdensServicoComponent },
      { path: 'produtos', component: Produtos },

      // 👇 ÁREA PROTEGIDA: Só o ADMIN entra aqui
      { path: 'mecanicos', component: Mecanicos, canActivate: [adminGuard] },
      { path: 'usuarios', component: Usuarios, canActivate: [adminGuard] },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
