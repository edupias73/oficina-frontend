import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model'; // Confirma se o caminho está correto

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private readonly API = 'http://localhost:8080/produtos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.API);
  }

  cadastrar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.API, produto);
  }

  atualizar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.API}/${produto.id}`, produto);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}