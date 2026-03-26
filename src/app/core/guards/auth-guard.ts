import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 1. Pega o token do bolso (TEM QUE SER O MESMO NOME DO AUTH.SERVICE)
  const token = localStorage.getItem('token');

  console.log('👮‍♂️ AuthGuard verificando acesso...');

  if (token) {
    console.log('✅ Token encontrado! Acesso liberado.');
    return true;
  } else {
    console.log('🚫 Sem token! Bloqueando e mandando pro Login.');
    router.navigate(['/login']);
    return false;
  }
};
