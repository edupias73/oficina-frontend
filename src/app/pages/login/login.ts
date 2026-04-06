import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  loginData = {
    login: '',
    senha: '',
  };

  carregando: boolean = false;
  erroLogin: string = '';

  // 👇 Injetamos o AuthService
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  entrar() {
  
  
    // 👇 Chamando o serviço do jeito certo
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.carregando = false;
        // O token já foi salvo lá no AuthService (pelo 'tap'). Só precisamos navegar!
        this.router.navigate(['/produtos']);
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 401 || err.status === 403) {
          this.erroLogin = 'Código da oficina, usuário ou senha incorretos.';
        } else {
          this.erroLogin = 'Erro de conexão com o servidor.';
        }
        console.error('Erro no login', err);
      },
    });
  }

  irParaRegistro() {
    this.router.navigate(['/registro']);
  }
}
