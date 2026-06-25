import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthLoginRequest, AuthRegisterRequest, AuthResponse, AuthProfile } from '../../shared/models/types';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  currentUser = signal<AuthProfile | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.isLoggedIn.set(this.tokenService.hasValidToken());
    if (this.isLoggedIn()) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    this.getProfile().subscribe({
      next: (profile) => {
        this.currentUser.set(profile);
        this.isLoggedIn.set(true);
      },
      error: () => {
        this.logout();
      }
    });
  }

  login(payload: AuthLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((response) => {
        this.tokenService.setToken(response.token);
        this.currentUser.set({ ...response.user, telephone: '' });
        this.isLoggedIn.set(true);
      })
    );
  }

  register(payload: AuthRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((response) => {
        this.tokenService.setToken(response.token);
        this.currentUser.set({ ...response.user, telephone: '' });
        this.isLoggedIn.set(true);
      })
    );
  }

  parseCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/auth/parse-cv`, formData);
  }

  getProfile(): Observable<AuthProfile> {
    return this.http.get<AuthProfile>(`${this.baseUrl}/auth/profile`);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }
}
