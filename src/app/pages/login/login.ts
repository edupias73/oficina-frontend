import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  // 👇 O envelope com as 3 chaves do SaaS
  loginData = {
    codigoEmpresa: '',
    login: '',
    senha: '',
  };

  carregando: boolean = false;
  erroLogin: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  entrar() {
    if (!this.loginData.codigoEmpresa || !this.loginData.login || !this.loginData.senha) {
      this.erroLogin = 'Preencha todos os campos para acessar.';
      return;
    }

    this.carregando = true;
    this.erroLogin = '';

    // 👇 Ajuste a URL se a sua porta for diferente de 8080
    this.http.post<any>('http://localhost:8080/auth/login', this.loginData).subscribe({
      next: (resposta) => {
        // Salva o Token no navegador
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('role', resposta.role);

        localStorage.setItem('empresaId', resposta.empresaId);

        this.carregando = false;

        // Redireciona pra tela principal (ajuste a rota se a sua chamar '/dashboard')
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
}
