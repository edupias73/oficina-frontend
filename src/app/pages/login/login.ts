import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html', // Verifique se o nome do arquivo é esse mesmo
  styleUrls: ['./login.scss'],
})
export class Login {
  // Objeto que segura os dados do formulário
  loginData = {
    email: '', // No HTML você chamou de email
    senha: '',
  };

  carregando = false;
  mensagemErro = '';

  constructor(private authService: AuthService, private router: Router) {}

  logar() {
    this.carregando = true;
    this.mensagemErro = '';

    const payload = {
      login: this.loginData.email,
      senha: this.loginData.senha,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        console.log('Login OK! Redirecionando...');

        // 👇 ESSA É A LINHA MÁGICA QUE TE LEVA PRA HOME
        this.router.navigate(['/home']);
      },
      error: (erro) => {
        console.error(erro);
        this.carregando = false;
        this.mensagemErro = 'Erro ao entrar!';
      },
    });
  }
}
