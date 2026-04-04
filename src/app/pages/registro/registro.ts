import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
})
export class RegistroComponent {
  dadosRegistro = {
    nomeFantasia: '',
    cnpj: '',
    telefone: '',
    codigoEmpresa: '',
    login: '',
    senha: '',
  };

  carregando = false;
  erro = '';
  sucesso = false;

  // 👇 Injetamos o AuthService
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  gerarCodigoAutomatico() {
    if (this.dadosRegistro.nomeFantasia && !this.dadosRegistro.codigoEmpresa) {
      const base = this.dadosRegistro.nomeFantasia
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 4);
      const random = Math.floor(100 + Math.random() * 900);
      this.dadosRegistro.codigoEmpresa = `${base}${random}`;
    }
  }

  registrar() {
    if (
      !this.dadosRegistro.nomeFantasia ||
      !this.dadosRegistro.login ||
      !this.dadosRegistro.senha
    ) {
      this.erro = 'Preencha o Nome da Oficina, E-mail e Senha!';
      return;
    }

    this.carregando = true;
    this.erro = '';

    if (!this.dadosRegistro.codigoEmpresa) this.gerarCodigoAutomatico();

    // 👇 Chamando a função do serviço
    this.authService.registrarNovaOficina(this.dadosRegistro).subscribe({
      next: () => {
        this.carregando = false;
        this.sucesso = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 4000);
      },
      error: (err) => {
        this.carregando = false;
        this.erro = 'Erro ao registar oficina. Verifique se o código ou e-mail já existem.';
        console.error(err);
      },
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}
