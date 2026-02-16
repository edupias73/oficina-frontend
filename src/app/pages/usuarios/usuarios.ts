import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true, // <--- OBRIGATÓRIO PARA AS ROTAS FUNCIONAREM
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios {
  // Lógica dos usuários vai aqui depois
}