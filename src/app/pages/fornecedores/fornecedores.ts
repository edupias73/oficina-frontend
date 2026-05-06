import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fornecedores.html',
  styleUrl: './fornecedores.scss',
})
export class FornecedoresComponent implements OnInit {
  listaFornecedores: any[] = [];
  listaCompleta: any[] = [];
  termoBusca: string = '';

  // --- CONTROLO DO MODAL ---
  modalAberto = false;
  modoEdicao = false;

  // --- DADOS DO FORMULÁRIO ---
  fornecedorAtual: any = {
    id: null,
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.carregarFornecedores();
  }

  // --- LISTAGEM E PESQUISA ---
  carregarFornecedores() {
    this.http.get<any[]>('https://oficina-backend-production-1f8e.up.railway.app/fornecedores').subscribe({
      next: (dados) => {
        this.listaFornecedores = dados;
        this.listaCompleta = dados;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar fornecedores', err),
    });
  }

  filtrarFornecedores() {
    if (!this.termoBusca) {
      this.listaFornecedores = [...this.listaCompleta];
      return;
    }
    const termo = this.termoBusca.toLowerCase();
    this.listaFornecedores = this.listaCompleta.filter(
      (f) => f.nomeFantasia.toLowerCase().includes(termo) || (f.cnpj && f.cnpj.includes(termo)),
    );
  }

  // --- ABRIR / FECHAR MODAL ---
  abrirModalCadastro() {
    this.modoEdicao = false;
    this.fornecedorAtual = {
      id: null,
      nomeFantasia: '',
      razaoSocial: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
    };
    this.modalAberto = true;
  }

  abrirModalEdicao(fornecedor: any) {
    this.modoEdicao = true;
    this.fornecedorAtual = { ...fornecedor }; // Cria uma cópia para não editar a lista diretamente
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  // --- SALVAR (CRIAR OU ATUALIZAR) ---
  salvarFornecedor() {
    if (!this.fornecedorAtual.nomeFantasia || !this.fornecedorAtual.cnpj) {
      alert('Preencha o Nome Fantasia e o CNPJ!');
      return;
    }

    if (this.modoEdicao) {
      // ATUALIZAR
      this.http.put('https://oficina-backend-production-1f8e.up.railway.app/fornecedores', this.fornecedorAtual).subscribe({
        next: () => {
          alert('✅ Fornecedor atualizado com sucesso!');
          this.fecharModal();
          this.carregarFornecedores();
        },
        error: () => alert('Erro ao atualizar fornecedor.'),
      });
    } else {
      // NOVO CADASTRO
      this.http.post('https://oficina-backend-production-1f8e.up.railway.app/fornecedores', this.fornecedorAtual).subscribe({
        next: () => {
          alert('🏢 Fornecedor cadastrado com sucesso!');
          this.fecharModal();
          this.carregarFornecedores();
        },
        error: () => alert('Erro ao cadastrar fornecedor.'),
      });
    }
  }

  // --- EXCLUIR LOGICAMENTE ---
  excluirFornecedor(id: number) {
    if (
      confirm(
        'Tem a certeza que deseja excluir este fornecedor? Ele vai sumir da lista, mas as compras antigas continuarão salvas.',
      )
    ) {
      this.http.delete(`https://oficina-backend-production-1f8e.up.railway.app/fornecedores/${id}`).subscribe({
        next: () => {
          this.carregarFornecedores();
        },
        error: () => alert('Erro ao excluir fornecedor.'),
      });
    }
  }
}
