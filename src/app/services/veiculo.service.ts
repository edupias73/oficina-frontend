import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Veiculo } from '../models/veiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  
  private readonly API = 'https://oficina-backend-production-1f8e.up.railway.app/veiculos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.API);
  }

  buscarPorId(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.API}/${id}`);
  }

  cadastrar(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.API, veiculo);
  }

  atualizar(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.API}/${veiculo.id}`, veiculo);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}