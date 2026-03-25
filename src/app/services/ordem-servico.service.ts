import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrdemServico } from '../models/ordem-servico.model';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {

  // Confirma se o teu Controller no Java está mapeado com este nome exato
  private readonly API = 'http://localhost:8080/ordens-servico'; 

  constructor(private http: HttpClient) { }

  listar(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.API);
  }

  buscarPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.API}/${id}`);
  }

  cadastrar(os: Partial<OrdemServico>): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.API, os);
  }

  atualizar(os: OrdemServico): Observable<OrdemServico> {
    return this.http.put<OrdemServico>(`${this.API}/${os.id}`, os);
  }

  // O motor do nosso Kanban: muda o carro de coluna!
  atualizarStatus(id: number, status: string): Observable<any> {
    // Envia apenas o novo status para o backend
    return this.http.patch(`${this.API}/${id}/status`, { status });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}