import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntrepriseProfile } from '../../shared/models/types';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<EntrepriseProfile> {
    return this.http.get<EntrepriseProfile>(`${this.baseUrl}/entreprises/profile`);
  }

  updateProfile(payload: Partial<EntrepriseProfile>): Observable<EntrepriseProfile> {
    return this.http.put<EntrepriseProfile>(`${this.baseUrl}/entreprises/profile`, payload);
  }
}
