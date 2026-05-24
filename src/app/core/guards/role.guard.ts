import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../shared/models/types';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as Role[]) || [];

  if (allowedRoles.length === 0) {
    return true;
  }

  const role = tokenService.getRole();
  if (!role || !allowedRoles.includes(role)) {
    router.navigate(['/offres']);
    return false;
  }

  return true;
};
