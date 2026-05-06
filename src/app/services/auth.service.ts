import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // O endereço do seu Java
  private apiUrl = '[https://oficina-backend-production-1f8e.up.railway.app](https://oficina-backend-production-1f8e.up.railway.app)/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(usuario: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, usuario).pipe(
      tap((resposta) => {
        if (resposta.token) {
          // Salvando todos os dados importantes
          localStorage.setItem('token', resposta.token);
          localStorage.setItem('role', resposta.role);
          localStorage.setItem('empresaId', resposta.empresaId);
          localStorage.setItem('nomeOficina', resposta.nomeOficina);
          console.log('✅ TOKEN E DADOS SALVOS COM SUCESSO!');
        } else {
          console.error('Erro: O Java não retornou o token.', resposta);
        }
      }),
    );
  }

  // 👇 NOVA FUNÇÃO: Chama a rota de registro do SaaS
  registrarNovaOficina(dados: any): Observable<any> {
    // responseType: 'text' porque o Java devolve apenas uma mensagem e não um JSON
    return this.http.post(`${this.apiUrl}/nova-oficina`, dados, { responseType: 'text' });
  }

  logout() {
    // Limpando tudo na saída
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('empresaId');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
