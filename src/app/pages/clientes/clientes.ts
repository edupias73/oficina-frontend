import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 👈 Importante

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 Adicionamos aqui
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class ClientesComponent implements OnInit {
  listaClientes: any[] = [];

  // Variáveis do Modal
  modalAberto = false;
  clienteEmEdicao: any = {};

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.http.get<any[]>('http://localhost:8080/clientes').subscribe({
      next: (dados) => {
        this.listaClientes = dados;
        this.cd.detectChanges();
      },
      error: (erro) => console.error(erro),
    });
  }

  // --- EXCLUIR ---
  excluirCliente(id: number) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.http.delete(`http://localhost:8080/clientes/${id}`).subscribe({
        next: () => {
          alert('🗑️ Cliente excluído!');
          this.carregarClientes();
        },
        error: (erro) => {
          alert('Erro ao excluir. Verifique se ele tem carros ou contas.');
          console.error(erro);
        },
      });
    }
  }

  // --- EDITAR (MODAL) ---
  abrirModal(cliente: any) {
    // Copia os dados para não editar a tabela direto
    this.clienteEmEdicao = { ...cliente };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEdicao() {
    // O Java espera um objeto com ID, Nome, Email, etc.
    this.http.put('http://localhost:8080/clientes', this.clienteEmEdicao).subscribe({
      next: () => {
        alert('✅ Cliente atualizado!');
        this.fecharModal();
        this.carregarClientes();
      },
      error: (erro) => {
        alert('Erro ao atualizar.');
        console.error(erro);
      },
    });
  }
}
