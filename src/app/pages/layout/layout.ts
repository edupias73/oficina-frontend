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
    if(confirm('Deseja realmente sair do sistema?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  // 👇 NOVA FUNÇÃO PARA TELA CHEIA
  alternarTelaCheia() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}