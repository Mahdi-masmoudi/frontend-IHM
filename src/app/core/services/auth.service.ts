import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthLoginRequest, AuthRegisterRequest, AuthResponse, AuthProfile } from '../../shared/models/types';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(payload: AuthLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((response) => this.tokenService.setToken(response.token))
    );
  }

  register(payload: AuthRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((response) => this.tokenService.setToken(response.token))
    );
  }

  getProfile(): Observable<AuthProfile> {
    return this.http.get<AuthProfile>(`${this.baseUrl}/auth/profile`);
  }

  logout(): void {
    this.tokenService.clearToken();
  }
}
