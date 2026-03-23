export interface Produto {
  id?: number;
  nome: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  ativo?: boolean;
  empresaId?: number; 
}