import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Nossos Modelos
import { OrdemServico, ItemPeca, ItemServico } from '../../models/ordem-servico.model';
import { Cliente } from '../../models/cliente.model';
import { Veiculo } from '../../models/veiculo.model';
import { Mecanico } from '../../models/mecanico.model';
import { Produto } from '../../models/produto.model';

// Nossos Services
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service'; // Assumindo que você tem este service
import { MecanicoService } from '../../services/mecanico.service';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.scss',
})
export class OrdensServicoComponent implements OnInit {
  // --- VARIÁVEIS DO KANBAN ---
  todasOS: OrdemServico[] = [];
  carregando: boolean = false;
  colunaOrcamento: OrdemServico[] = [];
  colunaAguardandoAprovacao: OrdemServico[] = [];
  colunaEmExecucao: OrdemServico[] = [];
  colunaAguardandoPeca: OrdemServico[] = [];
  colunaPronta: OrdemServico[] = [];

  // --- VARIÁVEIS DO MODAL GIGANTE ---
  exibirModal: boolean = false;
  abaAtual: 'dados' | 'pecas' | 'servicos' = 'dados'; // Controle das abas do modal

  // A O.S. que estamos criando ou editando agora
  osEmEdicao: Partial<OrdemServico> = {};

  // --- LISTAS PARA OS DROPDOWNS (SELECTS) ---
  listaClientes: Cliente[] = [];
  listaVeiculos: Veiculo[] = [];
  veiculosDoCliente: Veiculo[] = []; // Filtra os carros só do cliente selecionado
  listaMecanicos: Mecanico[] = [];
  listaProdutos: Produto[] = [];

  // --- VARIÁVEIS TEMPORÁRIAS PARA ADICIONAR ITENS ---
  novaPeca: ItemPeca = { produtoId: 0, quantidade: 1, valorUnitario: 0 };
  novoServico: ItemServico = { descricao: '', valor: 0 };

  constructor(
    private osService: OrdemServicoService,
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private mecanicoService: MecanicoService,
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarQuadro();
    this.carregarListasAuxiliares(); // Carrega os dados para os Selects
  }

  // ==========================================
  // LÓGICA DO KANBAN
  // ==========================================

  carregarQuadro() {
    this.carregando = true;
    this.osService.listar().subscribe({
      next: (dados) => {
        console.log('📦 PACOTE QUE CHEGOU DO JAVA:', dados);
        this.todasOS = dados;
        this.organizarKanban();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar o Pátio', err);
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  organizarKanban() {
    this.colunaOrcamento = this.todasOS.filter((os) => os.status === 'ORCAMENTO');
    this.colunaAguardandoAprovacao = this.todasOS.filter(
      (os) => os.status === 'AGUARDANDO_APROVACAO',
    );
    this.colunaEmExecucao = this.todasOS.filter((os) => os.status === 'EM_EXECUCAO');
    this.colunaAguardandoPeca = this.todasOS.filter((os) => os.status === 'AGUARDANDO_PECA');
    this.colunaPronta = this.todasOS.filter((os) => os.status === 'PRONTA');
  }

  // ==========================================
  // LÓGICA DO MODAL (O CÉREBRO DA O.S.)
  // ==========================================

  // Puxa tudo do banco de dados para os selects da tela
  carregarListasAuxiliares() {
    this.clienteService.listar().subscribe((dados) => (this.listaClientes = dados));
    this.veiculoService.listar().subscribe((dados) => (this.listaVeiculos = dados));
    this.mecanicoService.listar().subscribe((dados) => (this.listaMecanicos = dados));
    this.produtoService.listar().subscribe((dados) => (this.listaProdutos = dados));
  }

  abrirNovaOS() {
    // Zera a O.S. para um novo cadastro
    this.osEmEdicao = {
      status: 'ORCAMENTO',
      pecas: [],
      servicos: [],
      totalPecas: 0,
      totalServicos: 0,
      totalGeral: 0,
      desconto: 0,
    };
    this.abaAtual = 'dados';
    this.veiculosDoCliente = [];
    this.exibirModal = true;
  }

  verDetalhes(os: OrdemServico) {
    // Clona a O.S. para o modal (para não alterar a tela antes de salvar)
    this.osEmEdicao = JSON.parse(JSON.stringify(os));

    // Se não tiver listas, inicializa para não dar erro
    if (!this.osEmEdicao.pecas) this.osEmEdicao.pecas = [];
    if (!this.osEmEdicao.servicos) this.osEmEdicao.servicos = [];

    this.aoSelecionarCliente(); // Filtra os carros do cliente
    this.abaAtual = 'dados';
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

  trocarAba(aba: 'dados' | 'pecas' | 'servicos') {
    this.abaAtual = aba;
  }

  // Quando o usuário escolhe um cliente, mostra só os carros dele!
  aoSelecionarCliente() {
    if (this.osEmEdicao.clienteId) {
      this.veiculosDoCliente = this.listaVeiculos.filter((v) => {
        // Verifica tanto se o Java mandou o ID direto, ou se mandou dentro do objeto cliente
        const donoId = v.clienteId || (v.cliente && v.cliente.id);
        return donoId === this.osEmEdicao.clienteId;
      });
    } else {
      this.veiculosDoCliente = [];
    }
  }

  // ==========================================
  // LÓGICA DE PEÇAS E SERVIÇOS (CARRINHO)
  // ==========================================

  // Quando escolhe um produto no select, puxa o preço dele automaticamente
  aoSelecionarProdutoNaPeca() {
    const produtoEscolhido = this.listaProdutos.find((p) => p.id === this.novaPeca.produtoId);
    if (produtoEscolhido) {
      this.novaPeca.nomeProduto = produtoEscolhido.nome;
      this.novaPeca.valorUnitario = produtoEscolhido.precoVenda || 0;
    }
  }

  adicionarPecaLista() {
    if (!this.novaPeca.produtoId || this.novaPeca.quantidade <= 0) {
      alert('Selecione um produto e a quantidade!');
      return;
    }

    // Adiciona na lista temporária da O.S.
    this.osEmEdicao.pecas?.push({ ...this.novaPeca });

    // Limpa os campos para a próxima peça
    this.novaPeca = { produtoId: 0, quantidade: 1, valorUnitario: 0 };
    this.recalcularTotais();
  }

  removerPecaLista(index: number) {
    this.osEmEdicao.pecas?.splice(index, 1);
    this.recalcularTotais();
  }

  adicionarServicoLista() {
    if (!this.novoServico.descricao || this.novoServico.valor <= 0) {
      alert('Preencha a descrição do serviço e o valor!');
      return;
    }

    this.osEmEdicao.servicos?.push({ ...this.novoServico });
    this.novoServico = { descricao: '', valor: 0 };
    this.recalcularTotais();
  }

  removerServicoLista(index: number) {
    this.osEmEdicao.servicos?.splice(index, 1);
    this.recalcularTotais();
  }

  recalcularTotais() {
    let somaPecas = 0;
    this.osEmEdicao.pecas?.forEach((p) => {
      somaPecas += p.quantidade * p.valorUnitario;
    });

    let somaServicos = 0;
    this.osEmEdicao.servicos?.forEach((s) => {
      somaServicos += Number(s.valor); // Garante que é número
    });

    this.osEmEdicao.totalPecas = somaPecas;
    this.osEmEdicao.totalServicos = somaServicos;
    this.osEmEdicao.totalGeral = somaPecas + somaServicos - (this.osEmEdicao.desconto || 0);
  }

  // ==========================================
  // SALVAR NO BANCO DE DADOS
  // ==========================================

  salvarOS() {
    if (!this.osEmEdicao.clienteId || !this.osEmEdicao.veiculoId) {
      alert('Selecione o Cliente e o Veículo antes de salvar!');
      return;
    }

    if (this.osEmEdicao.id) {
      this.osService.atualizar(this.osEmEdicao as OrdemServico).subscribe({
        next: () => {
          alert('Ordem de Serviço atualizada!');
          this.fecharModal();
          this.carregarQuadro();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.osService.cadastrar(this.osEmEdicao).subscribe({
        next: () => {
          alert('Nova Ordem de Serviço criada com sucesso!');
          this.fecharModal();
          this.carregarQuadro();
        },
        error: (err) => console.error(err),
      });
    }
  }

  // (Manti a sua função do WhatsApp aqui no final)
  enviarWhatsApp(os: OrdemServico, event: Event) {
    event.stopPropagation();
    let texto = `Olá ${os.cliente?.nome}, tudo bem? Aqui é da oficina.`;
    if (os.status === 'AGUARDANDO_APROVACAO') {
      texto += ` O orçamento do seu ${os.veiculo?.modelo} ficou em R$ ${os.totalGeral}. Podemos aprovar o serviço?`;
    } else if (os.status === 'PRONTA') {
      texto += ` O seu ${os.veiculo?.modelo} já está pronto! Pode vir buscar quando quiser.`;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}
