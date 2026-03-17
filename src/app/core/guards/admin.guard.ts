import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  // 🕵️‍♂️ O segurança checa: "Você é ADMIN?"
  if (role === 'ADMIN') {
    return true; // Pode passar, patrão!
  } else {
    // Se for USER (mecânico), ele barra e manda de volta pros produtos
    alert('Acesso negado! Área restrita ao administrador.');
    router.navigate(['/produtos']);
    return false;
  }
};
