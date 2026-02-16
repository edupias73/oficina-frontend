import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';

// 👇 AQUI ESTAVA O CONFLITO. Ajustei para buscar nas pastas certas:
// "Volta duas pastas (../../), entra em models, pega o arquivo mecanico.model"
import { Mecanico } from '../../models/mecanico.model';

// "Volta duas pastas (../../), entra em services, pega o arquivo mecanico.service"
// OBS: Se o seu service estiver dentro de 'core', mude para '../../core/services/mecanico.service'
import { MecanicoService } from '../../services/mecanico.service'; 

@Component({
  selector: 'app-mecanicos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mecanicos.html',
  styleUrl: './mecanicos.scss'
})
export class Mecanicos implements OnInit {
  
  mecanicos: Mecanico[] = [];
  
  novoMec: Mecanico = { nome: '', comissaoPadrao: 0 };
  
  exibirModal: boolean = false;
  carregando: boolean = false;

  // O "private service" funciona agora porque importamos a classe MecanicoService lá em cima
  constructor(private service: MecanicoService) {}

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista() {
    this.carregando = true;
    this.service.listar().subscribe({
      next: (dados: Mecanico[]) => {
        this.mecanicos = dados;
        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar mecânicos', erro);
        this.carregando = false;
      }
    });
  }

  abrirModal() {
    this.novoMec = { nome: '', comissaoPadrao: 0 };
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

 
  salvar() {
  if (!this.novoMec.nome) {
    alert('Preencha o nome!');
    return;
  }

  this.service.cadastrar(this.novoMec).subscribe({
    next: () => {
      // FECHA O MODAL PRIMEIRO (Para o usuário ver a tabela atualizando)
      this.exibirModal = false; 
      
      // Depois limpa e recarrega
      this.novoMec = { nome: '', comissaoPadrao: 0 };
      this.carregarLista();
      
      console.log('Salvo com sucesso e modal fechado');
    },
    error: (err) => {
      alert('Erro ao salvar');
      console.error(err);
    }
  });
}

}