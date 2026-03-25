import { Cliente } from './cliente.model';

export interface Veiculo {
  id?: number;
  modelo: string;
  marca?: string;
  placa: string;
  cor?: string;
  ano?: number;
  clienteId?: number; // Para a hora de salvar
  cliente?: Cliente;  // Para a hora de listar/visualizar na tela
  ativo?: boolean;
  empresaId?: number;
}