import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuarios.html', // ou usuarios.component.html
  styleUrls: ['./usuarios.scss']  // ou usuarios.component.scss
})
export class Usuarios implements OnInit {
    
  listaUsuarios: Usuario[] = [];
  mostrarModal: boolean = false;
  carregando: boolean = false;
  
  novoUsuario: Usuario = {
    login: '',
    senha: '',
    role: 'USER' // Padrão é mecânico (USER)
  };

  constructor(private service: UsuarioService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista() {
    this.carregando = true;
    this.service.listar().subscribe({
      next: (dados: Usuario[]) => {
        this.listaUsuarios = dados;
        this.carregando = false;
        this.cdr.detectChanges(); // ⏰ Despertador para atualizar a tabela na hora!
      },
      error: (err: any) => {
        console.error('Erro ao buscar usuários', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() {
    // Limpa os campos toda vez que abre
    this.novoUsuario = { login: '', senha: '', role: 'USER' };
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
  }

  salvarUsuario() {
    if (!this.novoUsuario.login || !this.novoUsuario.senha) {
      alert('Preencha o e-mail (login) e a senha!');
      return;
    }

    this.service.cadastrar(this.novoUsuario).subscribe({
      next: () => {
        this.mostrarModal = false; 
        this.carregarLista(); // Recarrega a tabela automaticamente
      },
      error: (err) => {
        alert('Erro ao salvar o usuário. Verifique se o login já existe!');
        console.error(err);
      }
    });
  }

  excluir(id: number | undefined) {
    if (id && confirm('Tem certeza que deseja excluir este acesso?')) {
      this.service.excluir(id).subscribe({
        next: () => {
          this.carregarLista();
        },
        error: (err) => {
          alert('Erro ao excluir usuário.');
          console.error(err);
        }
      });
    }
  }
}