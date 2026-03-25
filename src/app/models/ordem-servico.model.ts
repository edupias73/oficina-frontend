import { Cliente } from './cliente.model';
import { Veiculo } from './veiculo.model';
import { Mecanico } from './mecanico.model';

export interface ItemPeca {
  id?: number;
  produtoId: number;
  nomeProduto?: string;
  quantidade: number;
  valorUnitario: number;
  subtotal?: number;
}

export interface ItemServico {
  id?: number;
  descricao: string;
  valor: number;
}

export interface OrdemServico {
  id?: number;
  
  // IDs para usar na hora de cadastrar
  clienteId?: number;
  veiculoId?: number;
  mecanicoId?: number;
  
  // Objetos completos que o Java devolve para desenharmos no ecrã
  cliente?: Cliente;
  veiculo?: Veiculo;
  mecanico?: Mecanico;
  
  dataAbertura?: string;
  dataFechamento?: string;
  previsaoEntrega?: string; // A nossa data crucial para o Kanban!
  quilometragem?: number;
  formaPagamento?: string;
  status?: string; // Ex: 'ORCAMENTO', 'EM_EXECUCAO', 'PRONTA'
  
  defeitoRelatado?: string;
  laudoTecnico?: string;
  observacoesInternas?: string;
  checklistJson?: string;
  
  totalPecas?: number;
  totalServicos?: number;
  totalGeral?: number;
  desconto?: number;
  
  pecas?: ItemPeca[];
  servicos?: ItemServico[];
}