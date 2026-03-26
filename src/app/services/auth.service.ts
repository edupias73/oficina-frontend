import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // O endereço do seu Java
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(usuario: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, usuario).pipe(
      tap((resposta) => {
        if (resposta.token) {
          // 👇 CORRIGIDO: Salvando com o nome exato que o Guard e o Interceptor procuram
          localStorage.setItem('token', resposta.token);
          console.log('✅ TOKEN SALVO COM SUCESSO!'); 
        } else {
          console.error(
            "O Java respondeu, mas não achei o campo 'token'. O que veio foi:",
            resposta
          );
        }
      })
    );
  }

  logout() {
    // 👇 CORRIGIDO: Removendo a chave certa
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken() {
    // 👇 CORRIGIDO: Buscando a chave certa
    return localStorage.getItem('token');
  }
}