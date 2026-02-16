import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  
  // Controle de Módulos (Abas Superiores)
  moduloAtivo: string = 'principal';

  constructor(private router: Router) {}

  selecionarModulo(modulo: string) {
    this.moduloAtivo = modulo;
  }

  sair() {
    // Adicionei um confirm para evitar cliques acidentais
    if(confirm('Deseja realmente sair do sistema?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }
}