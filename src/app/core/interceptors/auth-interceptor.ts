import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 👇 AQUI ESTAVA O ERRO! Mude de 'token' para 'meu_token_saas'
  const token = localStorage.getItem('meu_token_saas');

  // 🛑 PARE! Se for a rota de login ou register, não anexe nada. Passa reto.
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Se tiver token, anexa e manda
  if (token) {
    const cloneReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloneReq);
  }

  return next(req);
};
