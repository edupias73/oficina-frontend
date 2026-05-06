import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EstoqueService } from '../../services/estoque.service';

@Component({
  selector: 'app-acertos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acertos.html',
  styleUrl: './acertos.scss'
})
export class AcertosComponent implements OnInit {
  listaProdutos: any[] = [];
  produtosFiltrados: any[] = [];
  termoBusca = '';
  carregando = false;

  // Dados do formulário de ajuste
  produtoSelecionado: any = null;
  dadosMovimentacao = {
    tipo: 'AJUSTE_ENTRADA',
    quantidade: 1,
    motivo: ''
  };

  constructor(
    private http: HttpClient,
    private estoqueService: EstoqueService,
    private cdr: ChangeDetectorRef
    ) {}

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.carregando = true;
    this.http.get<any[]>('[https://oficina-backend-production-1f8e.up.railway.app](https://oficina-backend-production-1f8e.up.railway.app)/produtos').subscribe({
      next: (dados) => {
        this.listaProdutos = dados || [];
        this.produtosFiltrados = [...this.listaProdutos]; // 👈 AQUI: Mostra tudo por padrão!
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar() {
    if (!this.termoBusca.trim()) {
      this.produtosFiltrados = [...this.listaProdutos]; // 👈 AQUI: Se apagar a busca, volta tudo
      return;
    }
    const termo = this.termoBusca.toLowerCase();
    this.produtosFiltrados = this.listaProdutos.filter(p => 
      p.nome.toLowerCase().includes(termo) || (p.codigoFabricante && p.codigoFabricante.toLowerCase().includes(termo))
    );
  }

  selecionarProduto(p: any) {
    this.produtoSelecionado = p;
    this.termoBusca = '';
    this.dadosMovimentacao = { tipo: 'AJUSTE_ENTRADA', quantidade: 1, motivo: '' };
  }

  cancelarAjuste() {
    this.produtoSelecionado = null;
    this.filtrar(); // Recarrega a lista
    this.cdr.detectChanges();
  }

  confirmarAcerto() {
    if (this.dadosMovimentacao.quantidade <= 0 || !this.dadosMovimentacao.motivo.trim()) {
      alert('Preencha a quantidade e o motivo!');
      return;
    }

    const payload = {
      produtoId: this.produtoSelecionado.id,
      quantidade: this.dadosMovimentacao.quantidade,
      tipoMovimento: this.dadosMovimentacao.tipo,
      motivo: this.dadosMovimentacao.motivo
    };

    this.estoqueService.registrarMovimentacao(payload).subscribe({
      next: () => {
        alert('✅ Estoque ajustado com sucesso!');
        this.produtoSelecionado = null;
        this.carregarProdutos(); // Atualiza a lista com os novos saldos
      },
      error: (err: any) => alert('❌ Erro: ' + (err.error || 'Falha no ajuste'))
    });
  }
}