export interface Mecanico {
  id?: number;
  nome: string;
  comissaoPadrao: number; // No Java é Double
  ativo?: boolean;
}