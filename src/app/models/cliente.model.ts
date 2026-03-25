export interface Cliente {
  id?: number;
  nome: string;
  telefone?: string;
  documento?: string; // CPF, CNPJ, RUC
  email?: string;
  ativo?: boolean;
  empresaId?: number;
}