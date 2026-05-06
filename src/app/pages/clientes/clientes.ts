import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class ClientesComponent implements OnInit {
  listaClientes: any[] = [];
  termoBusca: string = '';
  listaCompleta: any[] = []; // Backup para filtro local se precisar

  // --- VARIÁVEIS DE EDIÇÃO ---
  modalAberto = false;
  clienteEmEdicao: any = {};

  // --- VARIÁVEIS DE CADASTRO (NOVO) ---
  modalCadastroAberto = false;
  dadosNovoCliente = {
    nome: '',
    documento: '', // CPF ou CNPJ
    telefone: '',
    email: ''
  };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarClientes();
  }

  // --- LISTAGEM ---
  carregarClientes() {
    this.http.get<any[]>('https://oficina-backend-production-1f8e.up.railway.app/clientes').subscribe({
      next: (dados) => {
        this.listaClientes = dados;
        this.listaCompleta = dados;
        this.cd.detectChanges();
      },
      error: (erro) => console.error('Erro ao carregar clientes:', erro),
    });
  }

  filtrarClientes() {
    if (!this.termoBusca) {
      this.listaClientes = [...this.listaCompleta];
      return;
    }
    const termo = this.termoBusca.toLowerCase();
    this.listaClientes = this.listaCompleta.filter(c => 
      c.nome.toLowerCase().includes(termo) || 
      (c.documento && c.documento.includes(termo))
    );
  }

  // --- CADASTRO (NOVO) ---
  abrirModalCadastro() {
    this.modalCadastroAberto = true;
    // Limpa o formulário
    this.dadosNovoCliente = { nome: '', documento: '', telefone: '', email: '' };
  }

  fecharModalCadastro() {
    this.modalCadastroAberto = false;
  }

  salvarNovoCliente() {
    // Validação básica
    if (!this.dadosNovoCliente.nome || this.dadosNovoCliente.nome.length < 3) {
      alert('O nome precisa ter pelo menos 3 letras!');
      return;
    }
    if (!this.dadosNovoCliente.telefone) {
      alert('O telefone é obrigatório!');
      return;
    }

    // 🛡️ A CORREÇÃO: Transforma texto vazio em 'null' para o banco de dados aceitar
    const dadosParaEnviar = {
      nome: this.dadosNovoCliente.nome,
      telefone: this.dadosNovoCliente.telefone,
      documento: this.dadosNovoCliente.documento || null,
      email: this.dadosNovoCliente.email || null
    };

    this.http.post('https://oficina-backend-production-1f8e.up.railway.app/clientes', dadosParaEnviar).subscribe({
      next: () => {
        alert('✅ Cliente cadastrado com sucesso!');
        this.fecharModalCadastro();
        this.carregarClientes(); // Atualiza a lista
      },
      error: (erro) => {
        console.error(erro);
        alert('Erro ao cadastrar. Verifique se o CPF/CNPJ já não existe no sistema.');
      }
    });
  }

  // --- EDIÇÃO (MANTIDO) ---
  abrirModal(cliente: any) {
    this.clienteEmEdicao = { ...cliente };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEdicao() {
    this.http.put('https://oficina-backend-production-1f8e.up.railway.app/clientes', this.clienteEmEdicao).subscribe({
      next: () => {
        alert('✅ Cliente atualizado!');
        this.fecharModal();
        this.carregarClientes();
      },
      error: () => alert('Erro ao atualizar.')
    });
  }

  excluirCliente(id: number) {
    if (confirm('Tem certeza? Isso pode apagar histórico de O.S.!')) {
      this.http.delete(`https://oficina-backend-production-1f8e.up.railway.app/clientes/${id}`).subscribe({
        next: () => this.carregarClientes(),
        error: () => alert('Não foi possível excluir (possui vínculos).')
      });
    }
  }
}