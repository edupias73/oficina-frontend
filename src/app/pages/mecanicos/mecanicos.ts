import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';

import { Mecanico } from '../../models/mecanico.model';
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

  constructor(private service: MecanicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista() {
    this.carregando = true;
    this.service.listar().subscribe({
      next: (dados: Mecanico[]) => {
        this.mecanicos = dados;
        this.carregando = false;
        this.cdr.detectChanges();
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

  // 👇 FUNÇÃO NOVA: Prepara os dados para editar
  editar(mec: Mecanico) {
    this.novoMec = { ...mec }; 
    this.exibirModal = true;
  }

  // 👇 FUNÇÃO NOVA: Chama o delete no service
  excluir(id: number) {
    if (confirm('Tem certeza que deseja excluir este mecânico?')) {
      this.service.excluir(id).subscribe({
        next: () => {
          this.carregarLista();
          alert('Mecânico excluído!');
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao excluir');
        }
      });
    }
  }
 
  salvar() {
    if (!this.novoMec.nome) {
      alert('Preencha o nome!');
      return;
    }

    const idDaOficina = Number(localStorage.getItem('empresaId'));
    
    // 👇 A CORREÇÃO: Usando 'oficinaId' igual no Java
    const dadosParaSalvar = {
      ...this.novoMec,       
      oficinaId: idDaOficina 
    };

    // SE TIVER ID, ATUALIZA
    if (this.novoMec.id) {
      this.service.atualizar(dadosParaSalvar).subscribe({
        next: () => {
          this.exibirModal = false;
          this.carregarLista();
          alert('Mecânico atualizado com sucesso!');
        },
        error: (err) => console.error(err)
      });
    } 
    // SE NÃO TIVER ID, CADASTRA NOVO
    else {
      this.service.cadastrar(dadosParaSalvar).subscribe({
        next: () => {
          this.exibirModal = false; 
          this.carregarLista();
          alert('Mecânico salvo com sucesso!');
        },
        error: (err) => console.error(err)
      });
    }
  }
}