import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router'; // <--- 1. Importe o Router

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  // 2. Injete o Router no construtor para poder navegar
  constructor(private router: Router) {}

  // 3. Crie a função Sair aqui dentro
  sair() {
    localStorage.removeItem('token'); // Apaga o crachá
    this.router.navigate(['/login']); // Manda pra fora
  }
}
