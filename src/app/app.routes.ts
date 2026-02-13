import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { ClientesComponent } from './pages/clientes/clientes';
import { authGuard } from './core/guards/auth-guard';
import { VeiculosComponent } from './pages/veiculos/veiculos';
import { OrdensServicoComponent } from './pages/ordens-servico/ordens-servico';
import { ProdutoService } from './services/produto.service';
import { ProdutosComponent } from './pages/produtos/produtos';

export const routes: Routes = [
  { path: 'login', component: Login },

  // ROTA PAI (O Layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'clientes', component: ClientesComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'ordens-servico', component: OrdensServicoComponent },

      // 👇 2. CORRIGI O NOME DO COMPONENTE AQUI (De 'Produtos' para 'ProdutosComponent')
      { path: 'produtos', component: ProdutosComponent },

      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // Rota coringa
  { path: '**', redirectTo: 'login' },
];
