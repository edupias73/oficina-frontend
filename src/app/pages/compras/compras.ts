import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.scss'
})
export class ComprasComponent implements OnInit {
  listaCompras: any[] = [];
  listaFornecedores: any[] = [];
  listaProdutos: any[] = [];

  modalAberto = false;

  novaCompra: any = {
    id: null, // Identificador para saber se é edição ou rascunho novo
    fornecedorId: null,
    dataCompra: '',
    numeroNota: '',
    frete: 0,
    impostos: 0,
    desconto: 0,
    ratearCustos: false,
    itens: []
  };

  itemAtual = {
    produtoId: null as number | null,
    codigoFabricante: '',
    nomeProduto: '',
    quantidade: 1,
    precoUnitario: 0, // Custo
    precoVendaAtual: 0,
    precoMaioristaAtual: 0,
    markupVarejo: 0,
    novoPrecoVarejo: 0,
    markupMaiorista: 0,
    novoPrecoMaiorista: 0
  };

  modalBuscaProdutoAberto = false;
  produtosFiltrados: any[] = [];
  termoBuscaProduto = '';
  indiceProdutoSelecionado = 0;

  modalNovoProdutoAberto = false;
  novoProduto = { nome: '', codigoFabricante: '', descricao: '' };

  // 👇 VARIÁVEL DO NOVO MODAL
  modalMarkupAberto = false;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarCompras();
    this.carregarFornecedores();
    this.carregarProdutos();
  }

  carregarCompras() {
    this.http.get<any[]>('http://localhost:8080/compras').subscribe(dados => { this.listaCompras = dados; this.cd.detectChanges(); });
  }

  carregarFornecedores() {
    this.http.get<any[]>('http://localhost:8080/fornecedores').subscribe(dados => this.listaFornecedores = dados);
  }

  carregarProdutos() {
    this.http.get<any[]>('http://localhost:8080/produtos').subscribe(dados => { this.listaProdutos = dados; this.produtosFiltrados = dados; });
  }

  // --- CONTROLE DA COMPRA ---
  abrirModal() {
    this.novaCompra = { id: null, fornecedorId: null, dataCompra: new Date().toISOString().split('T')[0], numeroNota: '', frete: 0, impostos: 0, desconto: 0, ratearCustos: true, itens: [] };
    this.resetarItemAtual();
    this.modalAberto = true;
  }

  abrirModalEdicao(resumo: any) {
    this.http.get<any>(`http://localhost:8080/compras/${resumo.id}`).subscribe({
      next: (compra) => {
        this.novaCompra = {
          id: compra.id,
          fornecedorId: compra.fornecedorId, // 👈 Agora bate com o DTO
          dataCompra: compra.dataCompra,
          numeroNota: compra.numeroNota,
          frete: compra.frete || 0,
          impostos: compra.impostos || 0,
          desconto: compra.desconto || 0,
          ratearCustos: compra.ratearCustos,
          status: compra.status,
          // Mapeia os itens garantindo que as chaves batam com o que o itemAtual usa
          itens: compra.itens.map((i: any) => ({
            produtoId: i.produtoId,
            nomeProduto: i.nomeProduto,
            codigoFabricante: i.codigoFabricante,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitario,
            precoVenda: i.precoVenda,
            precoMaiorista: i.precoMaiorista,
            subtotal: i.subtotal
          }))
        };
        this.modalAberto = true;
        this.cd.detectChanges();
      }
    });
  }

  fecharModal() {
    // 🔥 AUTO-SAVE: Salva silenciosamente se fechar sem querer
    if (this.novaCompra.fornecedorId && this.novaCompra.itens.length > 0) {
      this.salvarRascunho(true);
    } else {
      this.modalAberto = false;
    }
  }

  salvarRascunho(silencioso: boolean = false) {
    if (!this.novaCompra.fornecedorId || this.novaCompra.itens.length === 0) {
      if (!silencioso) alert('Selecione um fornecedor e adicione pelo menos uma peça!'); return;
    }

    // O Angular vai enviar os preços novos, mas precisaremos ajustar o Java futuramente para ele guardar isso no banco
    const dadosParaOJava = {
      ...this.novaCompra,
      itens: this.novaCompra.itens.map((i: any) => ({ 
        produtoId: Number(i.produtoId), quantidade: Number(i.quantidade), precoUnitario: Number(i.precoUnitario), precoVenda: Number(i.precoVenda), precoMaiorista: Number(i.precoMaiorista) 
      }))
    };

    if (this.novaCompra.id) {
      this.http.put(`http://localhost:8080/compras/${this.novaCompra.id}`, dadosParaOJava).subscribe({
        next: () => { if (!silencioso) alert('📝 Atualizado!'); this.modalAberto = false; this.carregarCompras(); }
      });
    } else {
      this.http.post('http://localhost:8080/compras', dadosParaOJava).subscribe({
        next: () => { if (!silencioso) alert('📝 Salvo!'); this.modalAberto = false; this.carregarCompras(); }
      });
    }
  }

  efetivarCompra(id: number, event: Event) {
    event.stopPropagation(); // Bloqueia o clique de abrir a nota
    if (confirm('Lançar as peças no estoque e alterar preços de custo?')) {
      this.http.put(`http://localhost:8080/compras/${id}/efetivar`, {}).subscribe({
        next: () => { alert('✅ Efetivada!'); this.carregarCompras(); }
      });
    }
  }

  excluirCompra(id: number, event: Event) {
    event.stopPropagation(); // Bloqueia o clique
    if (confirm('Excluir rascunho?')) {
      this.http.delete(`http://localhost:8080/compras/${id}`).subscribe({ next: () => this.carregarCompras() });
    }
  }

  // --- PDV E CADASTRO RÁPIDO ---
  abrirModalBuscaProduto() { this.termoBuscaProduto = ''; this.produtosFiltrados = [...this.listaProdutos]; this.indiceProdutoSelecionado = 0; this.modalBuscaProdutoAberto = true; }
  fecharModalBuscaProduto() { this.modalBuscaProdutoAberto = false; }
  abrirModalNovoProduto() { this.novoProduto = { nome: '', codigoFabricante: '', descricao: '' }; this.modalNovoProdutoAberto = true; }
  fecharModalNovoProduto() { this.modalNovoProdutoAberto = false; }

  filtrarProdutos() {
    const termo = this.termoBuscaProduto.toLowerCase();
    this.produtosFiltrados = this.listaProdutos.filter(p => p.nome.toLowerCase().includes(termo) || (p.codigoFabricante && p.codigoFabricante.toLowerCase().includes(termo)));
    this.indiceProdutoSelecionado = 0;
  }

  navegarComTeclado(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); if (this.indiceProdutoSelecionado < this.produtosFiltrados.length - 1) this.indiceProdutoSelecionado++; } 
    else if (event.key === 'ArrowUp') { event.preventDefault(); if (this.indiceProdutoSelecionado > 0) this.indiceProdutoSelecionado--; } 
    else if (event.key === 'Enter') { event.preventDefault(); if (this.produtosFiltrados.length > 0) this.confirmarProdutoBusca(this.produtosFiltrados[this.indiceProdutoSelecionado]); } 
    else if (event.key === 'Escape') { this.fecharModalBuscaProduto(); }
  }

  confirmarProdutoBusca(produto: any) {
    this.itemAtual.produtoId = produto.id;
    this.itemAtual.codigoFabricante = produto.codigoFabricante || 'S/N';
    this.itemAtual.nomeProduto = produto.nome;
    this.itemAtual.precoUnitario = produto.precoCusto || 0;
    this.itemAtual.precoVendaAtual = produto.precoVenda || 0;
    this.itemAtual.precoMaioristaAtual = produto.precoMaiorista || 0; // Previsão para o futuro
    this.fecharModalBuscaProduto();
  }

  salvarNovoProduto() {
    if (!this.novoProduto.nome) return;
    this.http.post<any>('http://localhost:8080/produtos', this.novoProduto).subscribe({
      next: (produtoCriado) => {
        this.carregarProdutos();
        this.confirmarProdutoBusca(produtoCriado);
        this.fecharModalNovoProduto();
      }
    });
  }

  // ==========================================
  // A MÁGICA DA FORMAÇÃO DE PREÇO (MARKUP)
  // ==========================================
  abrirModalMarkup() {
    if (!this.itemAtual.produtoId || this.itemAtual.quantidade <= 0 || this.itemAtual.precoUnitario < 0) {
      alert('Preencha os dados da peça corretamente antes de formar o preço!'); return;
    }
    
    const custo = this.itemAtual.precoUnitario;
    
    // Calcula sugestões baseadas no preço atual
    this.itemAtual.novoPrecoVarejo = this.itemAtual.precoVendaAtual > 0 ? this.itemAtual.precoVendaAtual : custo;
    this.itemAtual.markupVarejo = (custo > 0 && this.itemAtual.novoPrecoVarejo > custo) ? parseFloat((((this.itemAtual.novoPrecoVarejo / custo) - 1) * 100).toFixed(2)) : 0;

    this.itemAtual.novoPrecoMaiorista = this.itemAtual.precoMaioristaAtual > 0 ? this.itemAtual.precoMaioristaAtual : custo;
    this.itemAtual.markupMaiorista = (custo > 0 && this.itemAtual.novoPrecoMaiorista > custo) ? parseFloat((((this.itemAtual.novoPrecoMaiorista / custo) - 1) * 100).toFixed(2)) : 0;

    this.modalMarkupAberto = true;
  }

  calcularPorMarkup(tipo: 'VAREJO' | 'MAIORISTA') {
    const custo = this.itemAtual.precoUnitario;
    if (tipo === 'VAREJO') {
      this.itemAtual.novoPrecoVarejo = parseFloat((custo + (custo * (this.itemAtual.markupVarejo / 100))).toFixed(2));
    } else {
      this.itemAtual.novoPrecoMaiorista = parseFloat((custo + (custo * (this.itemAtual.markupMaiorista / 100))).toFixed(2));
    }
  }

  calcularPorPreco(tipo: 'VAREJO' | 'MAIORISTA') {
    const custo = this.itemAtual.precoUnitario;
    if (custo <= 0) return;
    if (tipo === 'VAREJO') {
      this.itemAtual.markupVarejo = parseFloat((((this.itemAtual.novoPrecoVarejo / custo) - 1) * 100).toFixed(2));
    } else {
      this.itemAtual.markupMaiorista = parseFloat((((this.itemAtual.novoPrecoMaiorista / custo) - 1) * 100).toFixed(2));
    }
  }

  confirmarMarkupEAdicionar() {
    this.novaCompra.itens.push({ 
      produtoId: this.itemAtual.produtoId, 
      codigoFabricante: this.itemAtual.codigoFabricante,
      nomeProduto: this.itemAtual.nomeProduto, 
      quantidade: this.itemAtual.quantidade, 
      precoUnitario: this.itemAtual.precoUnitario, // Custo da NFe
      precoVenda: this.itemAtual.novoPrecoVarejo,  // O que ele decidiu agora
      precoMaiorista: this.itemAtual.novoPrecoMaiorista, // O que ele decidiu agora
      subtotal: this.itemAtual.quantidade * this.itemAtual.precoUnitario 
    });

    this.modalMarkupAberto = false;
    this.resetarItemAtual();
  }

  removerItemDaLista(index: number) { this.novaCompra.itens.splice(index, 1); }
  calcularTotalProdutos(): number { return this.novaCompra.itens.reduce((acc: any, item: any) => acc + item.subtotal, 0); }
  calcularTotalGeral(): number { return this.calcularTotalProdutos() + this.novaCompra.frete + this.novaCompra.impostos - this.novaCompra.desconto; }
  
  resetarItemAtual() {
    this.itemAtual = { produtoId: null, codigoFabricante: '', nomeProduto: '', quantidade: 1, precoUnitario: 0, precoVendaAtual: 0, precoMaioristaAtual: 0, markupVarejo: 0, novoPrecoVarejo: 0, markupMaiorista: 0, novoPrecoMaiorista: 0 };
  }
}