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
import { ComprasComponent } from './pages/compras/compras';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores';
import { RegistroComponent } from './pages/registro/registro';
import { adminGuard } from './core/guards/admin.guard';
import { EstoqueComponent } from './pages/estoque/estoque';
import { DevolucoesComponent } from './pages/devolucoes/devolucoes';
import { AcertosComponent } from './pages/acertos/acertos';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'registro', component: RegistroComponent },

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
      { path: 'compras', component: ComprasComponent, canActivate: [authGuard] },
      { path: 'fornecedores', component: FornecedoresComponent, canActivate: [authGuard] },
      { path: 'estoque', component: EstoqueComponent, canActivate: [authGuard] },
      { path: 'acertos', component: AcertosComponent, canActivate: [authGuard] },

      //  ÁREA PROTEGIDA: Só o ADMIN entra aqui
      { path: 'mecanicos', component: Mecanicos, canActivate: [adminGuard] },
      { path: 'usuarios', component: Usuarios, canActivate: [adminGuard] },
      { path: 'devolucoes', component: DevolucoesComponent, canActivate: [authGuard] },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
