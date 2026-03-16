import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 1. IMPORTANTE
import { FormsModule } from '@angular/forms'; // 👈 2. IMPORTANTE
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-produtos',
  standalone: true, // Garante que é standalone
  imports: [CommonModule, FormsModule], // 👈 3. AQUI ESTÁ A CURA DOS ERROS
  templateUrl: './produtos.html',
  styleUrls: ['./produtos.scss'],
})
export class ProdutosComponent implements OnInit {
  listaProdutos: Produto[] = [];

  novoProduto: Produto = {
    nome: '',
    preco: 0,
    quantidadeEstoque: 0,
  };

  modalAberto = false;

  constructor(private service: ProdutoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.service.listar().subscribe({
      next: (dados: Produto[]) => {
        this.listaProdutos = dados;
        this.cdr.detectChanges();
      },
      error: (erro: any) => console.error('Erro ao buscar produtos', erro),
    });
  }

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.novoProduto = { nome: '', preco: 0, quantidadeEstoque: 0 };
  }

  salvarProduto() {
    this.service.salvar(this.novoProduto).subscribe({
      next: () => {
        alert('Produto salvo com sucesso!');
        this.carregarProdutos();
        this.fecharModal();
      },
      error: (erro: any) => {
        console.error(erro);
        alert('Erro ao salvar produto!');
      },
    });
  }
}
