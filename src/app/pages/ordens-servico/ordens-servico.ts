import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ItemPeca { id: number; nomePeca: string; qtd: number; valorUn: number; subtotal: number; }
export interface ItemServico { id: number; descricao: string; valor: number; nomeMecanico: string; }
export interface OrdemServico {
  id: number; clienteId: number; nomeCliente: string; modeloVeiculo: string; placaVeiculo: string;
  defeitoRelatado: string; status: string; dataAbertura: string;
  totalPecas: number; totalServicos: number; totalGeral: number;
  pecas: ItemPeca[]; servicos: ItemServico[];
}

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordens-servico.html',
  styleUrls: ['./ordens-servico.scss'],
})
export class OrdensServicoComponent implements OnInit {
  listaOS: OrdemServico[] = [];
  osSelecionada: OrdemServico | null = null;
  modalAberto = false;
  termoBusca: string = '';
  listaTodasOS: OrdemServico[] = [];

  // --- WIZARD NOVA OS ---
  modalNovaOSAberto = false;
  passoAtual = 1;
  modoExpress = false; // ⚡ NOVO: Controla se é modo rápido ou busca
  termoBuscaCliente = '';
  listaClientesEncontrados: any[] = [];
  clienteSelecionado: any = null;
  listaVeiculosDoCliente: any[] = [];
  dadosNovaOS = { veiculoId: null, defeitoRelatado: '' };
  buscando = false;
  timeoutBusca: any;

  // --- MODO EXPRESS (DADOS) ---
  dadosExpress = {
    nomeCliente: '',
    telefone: '',
    marca: 'Genérica',
    modelo: '',
    placa: '',
    cor: '',
    defeito: ''
  };

  // --- CADASTRO RÁPIDO DE VEÍCULO (NO PASSO 2) ---
  exibirFormVeiculo = false;
  novoVeiculoRapido = { marca: '', modelo: '', placa: '', cor: '', ano: 2025 };

  // --- ITENS ---
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

  carregarOS() {
    this.http.get<OrdemServico[]>('http://127.0.0.1:8080/os').subscribe({
      next: (dados) => {
        this.listaOS = dados;
        this.listaTodasOS = dados;
        this.cdr.detectChanges();
      },
      error: (erro) => console.error('Erro OS:', erro),
    });
  }

  // --- LOGICA DE NOVA OS ---

  abrirModalNovaOS() {
    this.modalNovaOSAberto = true;
    this.reiniciarFluxoNovaOS();
  }
  fecharModalNovaOS() { this.modalNovaOSAberto = false; }

  reiniciarFluxoNovaOS() {
    this.passoAtual = 1;
    this.modoExpress = false;
    this.termoBuscaCliente = '';
    this.listaClientesEncontrados = [];
    this.clienteSelecionado = null;
    this.listaVeiculosDoCliente = [];
    this.dadosNovaOS = { veiculoId: null, defeitoRelatado: '' };
    this.exibirFormVeiculo = false;
    this.dadosExpress = { nomeCliente: '', telefone: '', marca: '', modelo: '', placa: '', cor: '', defeito: '' };
  }

  // --- MODO EXPRESS (NOVO) ---
  ativarModoExpress() {
    this.modoExpress = true;
  }
  cancelarExpress() {
    this.modoExpress = false;
  }

  salvarOSExpress() {
    // Validação
    if (!this.dadosExpress.nomeCliente || !this.dadosExpress.placa || !this.dadosExpress.defeito) {
      alert('Preencha Nome, Placa e Defeito!');
      return;
    }

    // Monta o objeto igual ao backend espera (DadosAberturaOS)
    const payload = {
      veiculoId: null, // Null avisa o Java que é cadastro novo
      defeitoRelatado: this.dadosExpress.defeito,
      novoCliente: {
        nome: this.dadosExpress.nomeCliente,
        telefone: this.dadosExpress.telefone || 'Sem telefone',
        documento: '00000000000', // CPF Genérico
        email: ''
      },
      novoVeiculo: {
        marca: this.dadosExpress.marca || 'Genérica',
        modelo: this.dadosExpress.modelo,
        placa: this.dadosExpress.placa,
        cor: this.dadosExpress.cor,
        ano: 2025,
        clienteId: null // O backend resolve a relação
      }
    };

    this.http.post('http://127.0.0.1:8080/os', payload).subscribe({
      next: () => {
        alert('⚡ O.S. Express criada com sucesso!');
        this.fecharModalNovaOS();
        this.carregarOS();
      },
      error: (e) => {
        console.error(e);
        alert('Erro ao criar. Verifique se a placa já existe!');
      }
    });
  }

  // --- MODO CLÁSSICO (BUSCA) ---
  buscarComDelay() {
    clearTimeout(this.timeoutBusca);
    this.timeoutBusca = setTimeout(() => {
      if (this.termoBuscaCliente.length >= 3) this.buscarCliente();
    }, 200);
  }

  buscarCliente() {
    this.buscando = true;
    this.http.get<any[]>(`http://127.0.0.1:8080/clientes?busca=${this.termoBuscaCliente}`)
      .subscribe({
        next: (res) => { this.listaClientesEncontrados = res; this.buscando = false; },
        error: () => { this.buscando = false; }
      });
  }

  selecionarCliente(cliente: any) {
    this.clienteSelecionado = cliente;
    this.buscando = true;
    this.http.get<any[]>(`http://127.0.0.1:8080/veiculos?clienteId=${cliente.id}`)
      .subscribe({
        next: (res) => {
          this.listaVeiculosDoCliente = res;
          this.passoAtual = 2;
          this.buscando = false;
        },
        error: () => this.buscando = false
      });
  }

  voltarParaBusca() {
    this.passoAtual = 1;
    this.dadosNovaOS.veiculoId = null;
  }

  toggleFormVeiculo() {
    this.exibirFormVeiculo = !this.exibirFormVeiculo;
    this.novoVeiculoRapido = { marca: '', modelo: '', placa: '', cor: '', ano: 2025 };
  }

  salvarVeiculoRapido() {
    if (!this.clienteSelecionado) return;
    if (!this.novoVeiculoRapido.modelo || !this.novoVeiculoRapido.placa) {
      alert('Preencha Modelo e Placa!');
      return;
    }
    const payload = { ...this.novoVeiculoRapido, clienteId: this.clienteSelecionado.id };
    this.http.post('http://127.0.0.1:8080/veiculos', payload).subscribe({
      next: () => {
        alert('Carro cadastrado!');
        this.exibirFormVeiculo = false;
        this.selecionarCliente(this.clienteSelecionado);
      },
      error: () => alert('Erro ao cadastrar carro.')
    });
  }

  salvarNovaOS() {
    if (!this.dadosNovaOS.veiculoId || !this.dadosNovaOS.defeitoRelatado) {
      alert('Selecione o veículo e descreva o defeito!');
      return;
    }
    this.http.post('http://127.0.0.1:8080/os', this.dadosNovaOS).subscribe({
      next: () => {
        alert('🚀 O.S. Aberta!');
        this.fecharModalNovaOS();
        this.carregarOS();
      },
      error: () => alert('Erro ao criar O.S.'),
    });
  }

  // --- DETALHES, ITENS E IMPRESSÃO ---
  carregarAuxiliares() {
    this.http.get<any[]>('http://127.0.0.1:8080/mecanicos').subscribe((d) => (this.listaMecanicos = d));
    this.http.get<any[]>('http://127.0.0.1:8080/produtos').subscribe((d) => (this.listaProdutos = d));
  }

  abrirModalDetalhes(os: OrdemServico) {
    this.osSelecionada = os;
    this.modalAberto = true;
    this.carregarAuxiliares();
  }
  fecharModal() { this.modalAberto = false; this.osSelecionada = null; }

  abrirModalServico() { this.modalAddServicoAberto = true; }
  fecharModalServico() { this.modalAddServicoAberto = false; this.dadosServico = { descricao: '', valor: 0, mecanicoId: null }; }
  salvarServico() {
    if (!this.osSelecionada) return;
    this.http.post(`http://127.0.0.1:8080/os/${this.osSelecionada.id}/servicos`, this.dadosServico).subscribe({
      next: (os: any) => { this.osSelecionada = os; this.carregarOS(); this.fecharModalServico(); }
    });
  }

  abrirModalPeca() { this.modalAddPecaAberto = true; }
  fecharModalPeca() { this.modalAddPecaAberto = false; this.dadosPeca = { produtoId: null, quantidade: 1 }; }
  salvarPeca() {
    if (!this.osSelecionada) return;
    this.http.post(`http://127.0.0.1:8080/os/${this.osSelecionada.id}/itens`, this.dadosPeca).subscribe({
      next: (os: any) => { this.osSelecionada = os; this.carregarOS(); this.fecharModalPeca(); },
      error: () => alert('Erro: Estoque insuficiente?')
    });
  }

  imprimirOS() { window.print(); }
  deletarOS(id: number) {
    if(confirm('Excluir?')) this.http.delete(`http://127.0.0.1:8080/os/${id}`).subscribe(() => this.carregarOS());
  }
  filtrarOS() {
    if (!this.termoBusca) { this.listaOS = [...this.listaTodasOS]; return; }
    const t = this.termoBusca.toLowerCase();
    this.listaOS = this.listaTodasOS.filter(o => o.nomeCliente.toLowerCase().includes(t) || o.placaVeiculo.toLowerCase().includes(t));
  }

deletarServico(idServico: number) {
    if (!this.osSelecionada) return;
    if (!confirm('Remover este serviço da O.S.?')) return;

    this.http.delete(`http://127.0.0.1:8080/os/${this.osSelecionada.id}/servicos/${idServico}`)
      .subscribe({
        next: (osAtualizada: any) => {
          this.osSelecionada = osAtualizada; // Atualiza a tela com o novo total
          this.carregarOS(); // Atualiza a lista geral no fundo
        },
        error: (erro) => {
          console.error(erro);
          alert('Erro ao remover serviço.');
        }
      });
  }

  deletarPeca(idPeca: number) {
    if (!this.osSelecionada) return;
    if (!confirm('Remover esta peça e devolver ao estoque?')) return;

    this.http.delete(`http://127.0.0.1:8080/os/${this.osSelecionada.id}/itens/${idPeca}`)
      .subscribe({
        next: (osAtualizada: any) => {
          this.osSelecionada = osAtualizada; // Atualiza a tela com o novo total
          this.carregarOS(); // Atualiza a lista geral no fundo
        },
        error: (erro) => {
          console.error(erro);
          alert('Erro ao remover peça.');
        }
      });
  }
  finalizarOS() {
    if (!this.osSelecionada) return;

    // 1. Pergunta a forma de pagamento
    const pagamento = prompt('Qual a forma de pagamento?\n(Ex: Pix, Dinheiro, Cartão Crédito)');

    // Se o usuário clicar em Cancelar ou não digitar nada, a gente para.
    if (!pagamento) return;

    if (!confirm(`Confirma o recebimento de R$ ${this.osSelecionada.totalGeral} no ${pagamento}?`)) {
      return;
    }

    // 2. Envia pro Backend
    this.http.put(`http://127.0.0.1:8080/os/${this.osSelecionada.id}/finalizar`, pagamento).subscribe({
      next: (osAtualizada: any) => {
        alert('✅ O.S. Finalizada com sucesso!');
        this.osSelecionada = osAtualizada; // Atualiza a tela
        this.carregarOS(); // Atualiza a lista
        this.fecharModal();
      },
      error: (erro) => {
        console.error(erro);
        alert('Erro ao finalizar. Veja o console.');
      }
    });
  }

}