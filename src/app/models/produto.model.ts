export interface Produto {
  id?: number;
  codigoFabricante?: string;   // <-- Campo novo aqui!
  codigoOriginal?: string;     // <-- Campo novo aqui!
  nome: string;
  descricao?: string;          // <-- Campo novo aqui!
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque?: number;
  ativo?: boolean;
}