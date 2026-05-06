import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EstoqueService } from '../../services/estoque.service';

@Component({
  selector: 'app-devolucoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devolucoes.html',
  styleUrl: './devolucoes.scss'
})
export class DevolucoesComponent implements OnInit {
  listaHistorico: any[] = [];
  carregando = false;
  
  // Controle de tela: true = formulário, false = tabela de histórico
  modoNovaDevolucao = false; 

  // Variáveis da busca de peças (Para o Formulário)
  listaProdutos: any[] = [];
  produtosFiltrados: any[] = [];
  termoBusca = '';

  // Dados do formulário
  produtoSelecionado: any = null;
  quantidadeDevolvida: number = 1;
  motivoDevolucao: string = '';
  tipoMovimentoSelecionado: string = 'DEVOLUCAO_CLIENTE'; 

  constructor(private http: HttpClient, private estoqueService: EstoqueService) {}

  ngOnInit() {
    this.carregarHistorico();
  }

  // 👇 Carrega a tabela principal
  carregarHistorico() {
    this.carregando = true;
    this.estoqueService.listarDevolucoes().subscribe({
      next: (dados) => {
        this.listaHistorico = dados || [];
        this.carregando = false;
      },
      error: (err) => {
        console.error(err);
        this.carregando = false;
      }
    });
  }

  // 👇 Prepara o terreno para o formulário
  iniciarNovaDevolucao() {
    this.modoNovaDevolucao = true;
    this.produtoSelecionado = null;
    this.termoBusca = '';
    this.produtosFiltrados = [];
    
    // Aproveita para puxar as peças para a busca
    if (this.listaProdutos.length === 0) {
      this.http.get<any[]>('https://oficina-backend-production-1f8e.up.railway.app/produtos').subscribe(d => this.listaProdutos = d || []);
    }
  }

  cancelarNovaDevolucao() {
    this.modoNovaDevolucao = false;
    this.produtoSelecionado = null;
  }

  // --- Funções do Formulário (Iguais às que fizemos) ---
  filtrar() {
    if (!this.termoBusca.trim()) { this.produtosFiltrados = []; return; }
    const termo = this.termoBusca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.produtosFiltrados = this.listaProdutos.filter(p => 
      p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo) || 
      (p.codigoFabricante && p.codigoFabricante.toLowerCase().includes(termo))
    );
  }

  selecionarProduto(p: any) {
    this.produtoSelecionado = p;
    this.termoBusca = '';
    this.produtosFiltrados = [];
    this.quantidadeDevolvida = 1;
    this.motivoDevolucao = '';
    this.tipoMovimentoSelecionado = 'DEVOLUCAO_CLIENTE';
  }

  confirmarDevolucao() {
    if (this.quantidadeDevolvida <= 0 || !this.motivoDevolucao.trim()) {
      alert('Preencha a quantidade e o motivo!');
      return;
    }

    const payload = {
      produtoId: this.produtoSelecionado.id,
      quantidade: this.quantidadeDevolvida,
      tipoMovimento: this.tipoMovimentoSelecionado, 
      motivo: this.motivoDevolucao
    };

    this.estoqueService.registrarMovimentacao(payload).subscribe({
      next: () => {
        alert('✅ Devolução registada com sucesso!');
        this.modoNovaDevolucao = false; // Volta para a tabela
        this.carregarHistorico(); // Recarrega a tabela para mostrar o item novo!
      },
      error: (err: any) => alert('❌ Erro: ' + (err.error || 'Falha no registo'))
    });
  }
}