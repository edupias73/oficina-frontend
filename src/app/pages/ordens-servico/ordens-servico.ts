import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- INTERFACES ---
export interface ItemPeca {
  id: number;
  nomePeca: string;
  qtd: number;
  valorUn: number;
  subtotal: number;
}
export interface ItemServico {
  id: number;
  descricao: string;
  valor: number;
  nomeMecanico: string;
}
export interface OrdemServico {
  id: number;
  clienteId: number;
  nomeCliente: string;
  modeloVeiculo: string;
  placaVeiculo: string;
  defeitoRelatado: string;
  status: string;
  dataAbertura: string;
  totalPecas: number;
  totalServicos: number;
  totalGeral: number;
  pecas: ItemPeca[];
  servicos: ItemServico[];
}

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordens-servico.html',
  styleUrls: ['./ordens-servico.scss'],
})
export class OrdensServicoComponent implements OnInit {
  // --- VARIÁVEIS PRINCIPAIS ---
  listaOS: OrdemServico[] = [];
  osSelecionada: OrdemServico | null = null;
  modalAberto = false;
  termoBusca: string = '';
  listaTodasOS: OrdemServico[] = [];

  // --- VARIÁVEIS DE NOVA O.S. ---
  listaVeiculos: any[] = [];
  modalNovaOSAberto = false;
  dadosNovaOS = { veiculoId: null, defeitoRelatado: '' };

  // 👇 NOVAS VARIÁVEIS (PARA ADICIONAR ITENS)
  listaMecanicos: any[] = [];
  listaProdutos: any[] = [];

  modalAddServicoAberto = false;
  dadosServico = { descricao: '', valor: 0, mecanicoId: null };

  modalAddPecaAberto = false;
  dadosPeca = { produtoId: null, quantidade: 1 };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarOS();
  }

  // --- CARREGAMENTOS ---
  carregarOS() {
    this.http.get<OrdemServico[]>('http://localhost:8080/os').subscribe({
      next: (dados) => {
        this.listaOS = dados;
        this.listaTodasOS = dados;
        this.cdr.detectChanges();
      },
      error: (erro) => console.error('Erro OS:', erro),
    });
  }

  carregarVeiculos() {
    this.http.get<any[]>('http://localhost:8080/veiculos').subscribe({
      next: (d) => (this.listaVeiculos = d),
    });
  }

  //  BUSCAR MECÂNICOS E PRODUTOS DO BANCO
  carregarAuxiliares() {
    this.http
      .get<any[]>('http://localhost:8080/mecanicos')
      .subscribe((d) => (this.listaMecanicos = d));
    this.http
      .get<any[]>('http://localhost:8080/produtos')
      .subscribe((d) => (this.listaProdutos = d));
  }

  // --- MODAL DETALHES ---
  abrirModalDetalhes(os: OrdemServico) {
    this.osSelecionada = os;
    this.modalAberto = true;
    this.carregarAuxiliares(); //  Já carrega as listas pra estarem prontas se precisar
  }

  fecharModal() {
    this.modalAberto = false;
    this.osSelecionada = null;
  }

  // --- ADICIONAR SERVIÇO (COM MECÂNICO!) ---
  abrirModalServico() {
    this.modalAddServicoAberto = true;
  }
  fecharModalServico() {
    this.modalAddServicoAberto = false;
    this.dadosServico = { descricao: '', valor: 0, mecanicoId: null }; // Limpa
  }

  salvarServico() {
    if (!this.osSelecionada) return;

    // Validação simples
    if (!this.dadosServico.descricao || !this.dadosServico.mecanicoId) {
      alert('Preencha a descrição e escolha o mecânico!');
      return;
    }

    const url = `http://localhost:8080/os/${this.osSelecionada.id}/servicos`;
    this.http.post(url, this.dadosServico).subscribe({
      next: (osAtualizada: any) => {
        alert('Serviço adicionado!');
        this.osSelecionada = osAtualizada; // Atualiza o modal aberto com os novos totais
        this.carregarOS(); // Atualiza a lista lá atrás
        this.fecharModalServico();
      },
      error: (e) => alert('Erro ao salvar serviço.'),
    });
  }

  // --- ADICIONAR PEÇA ---
  abrirModalPeca() {
    this.modalAddPecaAberto = true;
  }
  fecharModalPeca() {
    this.modalAddPecaAberto = false;
    this.dadosPeca = { produtoId: null, quantidade: 1 };
  }

  salvarPeca() {
    if (!this.osSelecionada) return;

    if (!this.dadosPeca.produtoId || this.dadosPeca.quantidade < 1) {
      alert('Escolha o produto e uma quantidade válida.');
      return;
    }

    const url = `http://localhost:8080/os/${this.osSelecionada.id}/itens`;
    this.http.post(url, this.dadosPeca).subscribe({
      next: (osAtualizada: any) => {
        alert('Peça adicionada!');
        this.osSelecionada = osAtualizada;
        this.carregarOS();
        this.fecharModalPeca();
      },
      error: (e) => alert('Erro ao adicionar peça. Verifique o estoque.'),
    });
  }

  // --- RESTO DO CÓDIGO (Nova OS, Delete, Print, Filter...) ---
  abrirModalNovaOS() {
    this.modalNovaOSAberto = true;
    this.carregarVeiculos();
  }
  fecharModalNovaOS() {
    this.modalNovaOSAberto = false;
    this.dadosNovaOS = { veiculoId: null, defeitoRelatado: '' };
  }
  salvarNovaOS() {
    if (!this.dadosNovaOS.veiculoId || !this.dadosNovaOS.defeitoRelatado) {
      alert('Preencha tudo!');
      return;
    }
    this.http.post('http://localhost:8080/os', this.dadosNovaOS).subscribe({
      next: () => {
        alert('Sucesso!');
        this.fecharModalNovaOS();
        this.carregarOS();
      },
      error: () => alert('Erro ao criar.'),
    });
  }

  imprimirOS() {
    window.print();
  }

  deletarOS(id: number) {
    if (confirm(`Excluir OS #${id}?`)) {
      this.http.delete(`http://localhost:8080/os/${id}`).subscribe({
        next: () => this.carregarOS(),
        error: () => alert('Erro ao excluir.'),
      });
    }
  }

  filtrarOS() {
    // 1. Se a busca estiver vazia, restaura a lista completa original
    if (!this.termoBusca) {
      this.listaOS = [...this.listaTodasOS];
      return;
    }

    // 2. Transforma o texto em minúsculo para facilitar a comparação
    const termo = this.termoBusca.toLowerCase();

    // 3. Filtra usando o backup como base
    this.listaOS = this.listaTodasOS.filter(
      (os) =>
        os.nomeCliente.toLowerCase().includes(termo) ||
        os.placaVeiculo.toLowerCase().includes(termo) ||
        os.id.toString().includes(termo)
    );
  }
}
