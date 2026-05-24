import { Injectable } from '@angular/core';
import { Role } from '../../shared/models/types';

interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly tokenKey = 'recrutement_token';

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  hasValidToken(): boolean {
    const payload = this.getPayload();
    if (!payload) {
      return false;
    }
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  }

  getRole(): Role | null {
    return this.getPayload()?.role ?? null;
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const decoded = atob(padded);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}
