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
        // 👇 AQUI É O PULO DO GATO
        // Se no Java o DTO for 'token', aqui tem que ser resposta.token
        if (resposta.token) {
          localStorage.setItem('meu_token_saas', resposta.token);
          console.log('TOKEN SALVO COM SUCESSO!'); // Adicione este log pra gente ver
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
    localStorage.removeItem('meu_token_saas');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('meu_token_saas');
  }
}
