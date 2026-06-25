import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidature } from '../../shared/models/types';

@Injectable({ providedIn: 'root' })
export class CandidaturesService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  apply(offreId: string, cvId: string, lettreId: string, commentaire?: string): Observable<Candidature> {
    return this.http.post<Candidature>(`${this.baseUrl}/candidatures`, { offreId, cvId, lettreId, commentaire });
  }

  listMine(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.baseUrl}/candidatures/me`);
  }

  listByOffre(offreId: string): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.baseUrl}/candidatures/offre/${offreId}`);
  }

  listForEntreprise(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.baseUrl}/entreprises/candidatures`);
  }

  accept(id: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.baseUrl}/candidatures/${id}/accepter`, {});
  }

  reject(id: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.baseUrl}/candidatures/${id}/rejeter`, {});
  }

}
