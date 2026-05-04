import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private readonly API = 'http://localhost:8080/estoque';

  constructor(private http: HttpClient) { }

  registrarMovimentacao(dados: { produtoId: number, quantidade: number, tipoMovimento: string, motivo: string }): Observable<any> {
    return this.http.post(`${this.API}/movimentar`, dados);
  }

  // 👇 NOVO: Puxa o histórico
  listarDevolucoes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/devolucoes`);
  }
}