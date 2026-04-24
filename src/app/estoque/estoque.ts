import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estoque.html',
  styleUrl: './estoque.scss'
})
export class EstoqueComponent implements OnInit {
  listaProdutos: any[] = [];
  produtosFiltrados: any[] = [];
  termoBusca = '';
  carregando = true; // 👈 Adicionamos um controle de Loading

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarEstoque();
  }

  carregarEstoque() {
    this.carregando = true;
    this.http.get<any[]>('http://localhost:8080/produtos').subscribe({
      next: (dados) => {
        this.listaProdutos = dados || [];
        this.produtosFiltrados = [...this.listaProdutos]; // 👈 Garante que a tela já nasce cheia!
        this.carregando = false;
        this.cdr.detectChanges(); // Força o Angular a desenhar a tela
      },
      error: () => {
        this.carregando = false;
        alert('Erro ao carregar o estoque.');
      }
    });
  }

  // ==========================================
  // O MOTOR DE BUSCA "MASTER"
  // ==========================================
  filtrar() {
    // Se apagar a busca, volta a mostrar o estoque inteiro na hora
    if (!this.termoBusca || this.termoBusca.trim() === '') {
      this.produtosFiltrados = [...this.listaProdutos];
      return;
    }

    // 1. Limpa o que o cara digitou (tira acentos) e divide por espaços
    // Ex: "Filtro Óleo" vira um array: ["filtro", "oleo"]
    const termosDigitados = this.removerAcentos(this.termoBusca.toLowerCase())
                                .split(' ')
                                .filter(t => t.trim() !== '');

    this.produtosFiltrados = this.listaProdutos.filter(produto => {
      // 2. Cria um "texto gigante" com tudo que a peça tem (Nome + Código + Descrição)
      const textoDaPeca = this.removerAcentos(
        `${produto.nome} ${produto.codigoFabricante || ''} ${produto.descricao || ''}`.toLowerCase()
      );

      // 3. A MÁGICA: A peça só aparece se TIVER TODAS as palavras digitadas no "texto gigante"
      return termosDigitados.every(termo => textoDaPeca.includes(termo));
    });
  }

  // Função auxiliar para arrancar acentos e cedilhas
  removerAcentos(texto: string): string {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar(); // Chama o filtro vazio para mostrar tudo
  }
}