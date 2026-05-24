import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offre, PaginatedResult } from '../../shared/models/types';

export interface OffreFilters {
  q?: string;
  typeContrat?: string;
  localisation?: string;
  statut?: string;
  salaireMin?: number;
  salaireMax?: number;
  entreprise?: string;
  sortBy?: 'datePublication' | 'salaire';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  mine?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OffresService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(filters: OffreFilters = {}): Observable<PaginatedResult<Offre>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResult<Offre>>(`${this.baseUrl}/offres`, { params });
  }

  getById(id: number): Observable<Offre> {
    return this.http.get<Offre>(`${this.baseUrl}/offres/${id}`);
  }

  create(payload: Partial<Offre>): Observable<Offre> {
    return this.http.post<Offre>(`${this.baseUrl}/offres`, payload);
  }

  update(id: number, payload: Partial<Offre>): Observable<Offre> {
    return this.http.put<Offre>(`${this.baseUrl}/offres/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/offres/${id}`);
  }
}
