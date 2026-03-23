import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 👇 AQUI ESTÁ A CORREÇÃO: Buscando na gaveta certa ('token')
  const token = localStorage.getItem('token');

  // 🛑 PARE! Se for a rota de login ou register, não anexe nada. Passa reto.
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Se tiver token, anexa e manda
  if (token) {
    const cloneReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // O espaço depois do Bearer já está certinho!
      },
    });
    return next(cloneReq);
  }

  return next(req);
};