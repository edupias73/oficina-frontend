export interface Produto {
  id?: number; // O '?' significa que o ID é opcional (pq na hora de criar, ainda não tem ID)
  nome: string;
  preco: number;
  quantidadeEstoque: number; // 👇 Esse é o campo novo que adicionamos no Java
}
