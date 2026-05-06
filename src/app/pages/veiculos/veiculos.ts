import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.html',
  styleUrl: './veiculos.scss',
})
export class VeiculosComponent implements OnInit {
  listaVeiculos: any[] = [];
  listaClientes: any[] = []; // Precisamos disso para o <select> de dono
  termoBusca: string = '';
  listaCompleta: any[] = [];

  // --- CADASTRO ---
  modalCadastroAberto = false;
  dadosNovoVeiculo = {
    marca: '', modelo: '', placa: '', cor: '', ano: 2024, clienteId: null
  };

  // --- EDIÇÃO ---
  modalEdicaoAberto = false;
  veiculoEmEdicao: any = {};

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarFrota();
    this.carregarClientes(); // Carrega clientes pro Select
  }

  carregarFrota() {
    this.http.get<any[]>('[https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app](https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app)/veiculos').subscribe({
      next: (dados) => {
        this.listaVeiculos = dados;
        this.listaCompleta = dados;
        this.cd.detectChanges();
      }
    });
  }

  carregarClientes() {
    this.http.get<any[]>('[https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app](https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app)/clientes').subscribe(d => this.listaClientes = d);
  }

  filtrarVeiculos() {
    if (!this.termoBusca) {
      this.listaVeiculos = [...this.listaCompleta];
      return;
    }
    const t = this.termoBusca.toLowerCase();
    this.listaVeiculos = this.listaCompleta.filter(v => 
      v.placa.toLowerCase().includes(t) || 
      v.modelo.toLowerCase().includes(t) ||
      (v.cliente && v.cliente.nome.toLowerCase().includes(t))
    );
  }

  // --- NOVO VEÍCULO ---
  abrirModalCadastro() {
    this.modalCadastroAberto = true;
    this.dadosNovoVeiculo = { marca: '', modelo: '', placa: '', cor: '', ano: 2024, clienteId: null };
  }

  fecharModalCadastro() { this.modalCadastroAberto = false; }

  salvarNovoVeiculo() {
    if (!this.dadosNovoVeiculo.placa || !this.dadosNovoVeiculo.clienteId) {
      alert('Preencha a placa e escolha o dono!');
      return;
    }
    this.http.post('[https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app](https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app)/veiculos', this.dadosNovoVeiculo).subscribe({
      next: () => {
        alert('🚗 Veículo cadastrado!');
        this.fecharModalCadastro();
        this.carregarFrota();
      },
      error: () => alert('Erro ao cadastrar.')
    });
  }

  // --- EDIÇÃO ---
  abrirModalEdicao(veiculo: any) {
    this.veiculoEmEdicao = { ...veiculo, clienteId: veiculo.cliente?.id };
    this.modalEdicaoAberto = true;
  }
  fecharModalEdicao() { this.modalEdicaoAberto = false; }

  salvarEdicao() {
    this.http.put('[https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app](https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app)/veiculos', this.veiculoEmEdicao).subscribe({
      next: () => {
        alert('✅ Veículo atualizado!');
        this.fecharModalEdicao();
        this.carregarFrota();
      },
      error: () => alert('Erro ao atualizar.')
    });
  }

  excluirVeiculo(id: number) {
    if(confirm('Excluir este veículo?')) {
      this.http.delete(`[https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app](https://https://oficina-backend-production-1f8e.up.railway.app-1f8e.up.railway.app)/veiculos/${id}`).subscribe(() => this.carregarFrota());
    }
  }
}