import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EstoqueService } from '../../services/estoque.service'; // 👈 Importa o novo serviço

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
  carregando = true;

  // 👇 Variáveis de controle do Modal Rápido
  mostrarModal = false;
  produtoSelecionado: any = null;
  dadosMovimentacao = {
    tipo: 'AJUSTE_ENTRADA',
    quantidade: 1,
    motivo: ''
  };

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private estoqueService: EstoqueService // 👈 Injeta o serviço
  ) {}

  ngOnInit() {
    this.carregarEstoque();
  }

  carregarEstoque() {
    this.carregando = true;
    this.http.get<any[]>('[https://oficina-backend-production-1f8e.up.railway.app](https://oficina-backend-production-1f8e.up.railway.app)/produtos').subscribe({
      next: (dados) => {
        this.listaProdutos = dados || [];
        // Se houver busca ativa, mantemos o filtro. Se não, mostra tudo.
        if (this.termoBusca) {
          this.filtrar();
        } else {
          this.produtosFiltrados = [...this.listaProdutos];
        }
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        alert('Erro ao carregar o estoque.');
      }
    });
  }

  filtrar() {
    if (!this.termoBusca || this.termoBusca.trim() === '') {
      this.produtosFiltrados = [...this.listaProdutos];
      return;
    }
    const termosDigitados = this.removerAcentos(this.termoBusca.toLowerCase())
                                .split(' ')
                                .filter(t => t.trim() !== '');

    this.produtosFiltrados = this.listaProdutos.filter(produto => {
      const textoDaPeca = this.removerAcentos(
        `${produto.nome} ${produto.codigoFabricante || ''} ${produto.descricao || ''}`.toLowerCase()
      );
      return termosDigitados.every(termo => textoDaPeca.includes(termo));
    });
  }

  removerAcentos(texto: string): string {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrar();
  }

  // ==========================================
  // FUNÇÕES DO MODAL DE MOVIMENTAÇÃO
  // ==========================================

  abrirModal(produto: any) {
    this.produtoSelecionado = produto;
    this.dadosMovimentacao = {
      tipo: 'AJUSTE_ENTRADA', // 👈 Padrão do Java para "Sobras"
      quantidade: 1,
      motivo: ''
    };
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
    this.produtoSelecionado = null;
  }

  salvarMovimentacao() {
    if (!this.dadosMovimentacao.quantidade || this.dadosMovimentacao.quantidade <= 0) {
      alert('A quantidade deve ser maior que zero!');
      return;
    }
    if (!this.dadosMovimentacao.motivo.trim()) {
      alert('Por favor, informe o motivo do acerto de inventário.');
      return;
    }

    const payload = {
      produtoId: this.produtoSelecionado.id,
      quantidade: this.dadosMovimentacao.quantidade,
      tipoMovimento: this.dadosMovimentacao.tipo, // 👈 Envia direto o Enum do HTML
      motivo: this.dadosMovimentacao.motivo
    };

    this.estoqueService.registrarMovimentacao(payload).subscribe({
      next: () => {
        alert('✅ Acerto de estoque registado com sucesso!');
        this.fecharModal();
        this.carregarEstoque(); // Atualiza a vitrine
      },
      error: (err: any) => {
        alert('❌ Erro: ' + (err.error || 'Não foi possível registar o acerto.'));
      }
    });
  }
}