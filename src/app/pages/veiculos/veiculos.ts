import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 👈 1. IMPORTANTE PARA O MODAL

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 2. ADICIONE AQUI
  templateUrl: './veiculos.html', // Verifique se o nome é esse mesmo ou veiculos.component.html
  styleUrl: './veiculos.scss',
})
export class VeiculosComponent implements OnInit {
  listaVeiculos: any[] = [];

  // Variáveis para o Modal de Edição
  modalAberto = false;
  veiculoEmEdicao: any = {}; // Guarda os dados do carro que estamos mexendo

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarFrota();
  }

  carregarFrota() {
    this.http.get<any[]>('http://localhost:8080/veiculos').subscribe({
      next: (dados) => {
        this.listaVeiculos = dados;
        this.cd.detectChanges();
      },
      error: (erro) => console.error(erro),
    });
  }

  // --- LÓGICA DE EDITAR (NOVO) ---

  abrirModalEdicao(veiculo: any) {
    // Clona o objeto para não editar a tabela em tempo real antes de salvar
    this.veiculoEmEdicao = { ...veiculo };
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEdicao() {
    // 👇 A MÁGICA: Preparamos o pacote do jeito que o Java gosta
    const dadosParaEnviar = {
      id: this.veiculoEmEdicao.id,
      marca: this.veiculoEmEdicao.marca,
      modelo: this.veiculoEmEdicao.modelo,
      placa: this.veiculoEmEdicao.placa,
      cor: this.veiculoEmEdicao.cor,
      ano: this.veiculoEmEdicao.ano,

      // Aqui extraímos apenas o número do ID do cliente
      // O '?' serve para não quebrar se o cliente for nulo
      clienteId: this.veiculoEmEdicao.cliente?.id,
    };

    this.http.put('http://localhost:8080/veiculos', dadosParaEnviar).subscribe({
      next: (veiculoAtualizado) => {
        alert('✅ Veículo atualizado com sucesso!');
        this.modalAberto = false;
        this.carregarFrota();
      },
      error: (erro) => {
        console.error(erro);
        alert('❌ Erro ao atualizar veículo (Veja o console).');
      },
    });
  }

  // --- MÉTODOS ANTIGOS ---

  abrirOS(veiculo: any) {
    const defeito = window.prompt(`Qual o defeito do ${veiculo.modelo}?`);
    if (!defeito) return;

    const payload = { veiculoId: veiculo.id, defeitoRelatado: defeito };
    this.http.post('http://localhost:8080/os', payload, { responseType: 'text' }).subscribe({
      next: (msg) => alert('✅ ' + msg),
      error: () => alert('Erro ao abrir OS.'),
    });
  }

  excluirVeiculo(id: number) {
    if (confirm('Tem certeza que deseja excluir?')) {
      this.http.delete(`http://localhost:8080/veiculos/${id}`).subscribe({
        next: () => {
          alert('🗑️ Veículo excluído!');
          this.carregarFrota();
        },
        error: () => alert('Erro ao excluir. Verifique vínculos.'),
      });
    }
  }
}
