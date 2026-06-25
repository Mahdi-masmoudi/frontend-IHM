import { inject, Injector } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const injector = inject(Injector);

  const token = tokenService.getToken();
  let cloneReq = req;
  if (token) {
    cloneReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(cloneReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Resolve AuthService lazily to prevent circular dependency
        const authService = injector.get(AuthService);
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
