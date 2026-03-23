import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';

import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto.service'; 

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss'
})
export class Produtos implements OnInit {
  
  produtos: Produto[] = [];
  novoProd: Produto = { nome: '', precoCusto: 0, precoVenda: 0, quantidadeEstoque: 0 };
  exibirModal: boolean = false;
  carregando: boolean = false;

  constructor(private service: ProdutoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista() {
    this.carregando = true;
    this.service.listar().subscribe({
      next: (dados: Produto[]) => {
        this.produtos = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao buscar produtos', erro);
        this.carregando = false;
      }
    });
  }

  abrirModal() {
    this.novoProd = { nome: '', precoCusto: 0, precoVenda: 0, quantidadeEstoque: 0 };
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

  editar(prod: Produto) {
    this.novoProd = { ...prod }; 
    this.exibirModal = true;
  }

  excluir(id: number) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.service.excluir(id).subscribe({
        next: () => {
          this.carregarLista();
          alert('Produto excluído!');
        },
        error: (err) => console.error(err)
      });
    }
  }
 
  salvar() {
    if (!this.novoProd.nome) {
      alert('Preencha o nome da peça!');
      return;
    }

    const idDaOficina = Number(localStorage.getItem('empresaId'));
    
    const dadosParaSalvar = {
      ...this.novoProd,       
      empresaId: idDaOficina 
    };

    if (this.novoProd.id) {
      this.service.atualizar(dadosParaSalvar).subscribe({
        next: () => {
          this.exibirModal = false;
          this.carregarLista();
          alert('Produto atualizado!');
        },
        error: (err) => console.error(err)
      });
    } else {
      this.service.cadastrar(dadosParaSalvar).subscribe({
        next: () => {
          this.exibirModal = false; 
          this.carregarLista();
          alert('Produto cadastrado!');
        },
        error: (err) => console.error(err)
      });
    }
  }
}