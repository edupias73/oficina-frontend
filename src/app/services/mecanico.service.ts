import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 👇 AJUSTE AQUI: Se a pasta models está em 'src/app/models'
import { Mecanico } from '../models/mecanico.model'; 

@Injectable({
  providedIn: 'root'
})
export class MecanicoService {

  // Confirme se a porta do Java é 8080
  private readonly API = 'http://localhost:8080/mecanicos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Mecanico[]> {
    return this.http.get<Mecanico[]>(this.API);
  }

  cadastrar(mecanico: Mecanico): Observable<Mecanico> {
    return this.http.post<Mecanico>(this.API, mecanico);
  }
}