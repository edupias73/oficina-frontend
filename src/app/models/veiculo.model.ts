import { Cliente } from './cliente.model';

export interface Veiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  clienteId?: number; // ID do dono do carro
  cliente?: Cliente;  // Objeto completo do dono (opcional)
  ativo?: boolean;
}