import { Component, OnInit } from '@angular/core'; // 👈 1. Importamos o OnInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnInit { // 👈 2. Adicionamos o implements OnInit
  
  // Controle de Módulos (Abas Superiores)
  moduloAtivo: string = 'principal';

  // 👇 3. Criamos a variável para guardar o nome
  nomeDaOficina: string = '';

  constructor(private router: Router) {}

  // 👇 4. Puxamos o nome do navegador assim que a tela carregar
  ngOnInit() {
    this.nomeDaOficina = localStorage.getItem('nomeOficina') || 'Minha Oficina';
  }

  selecionarModulo(modulo: string) {
    this.moduloAtivo = modulo;
  }

  sair() {
    if(confirm('Deseja realmente sair do sistema?')) {
      // Limpa todos os dados de segurança ao sair
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('empresaId');
      localStorage.removeItem('nomeOficina'); // 👈 Limpamos o nome também!
      this.router.navigate(['/login']);
    }
  }

  // FUNÇÃO PARA TELA CHEIA
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