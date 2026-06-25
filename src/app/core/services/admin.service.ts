import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offre } from '../../shared/models/types';

export interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  isActive?: boolean;
}

export interface AdminCandidat {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  niveauEtude: string;
  experience: number;
  isActive?: boolean;
}

export interface AdminEntreprise {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  nomEntreprise: string;
  adresseEntreprise: string;
  secteurActivite: string;
  description: string;
  logo?: string | null;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admin/users`);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${id}`);
  }

  listOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.baseUrl}/admin/offres`);
  }

  deleteOffre(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/offres/${id}`);
  }

  listCandidats(): Observable<AdminCandidat[]> {
    return this.http.get<AdminCandidat[]>(`${this.baseUrl}/admin/candidats`);
  }

  listEntreprises(): Observable<AdminEntreprise[]> {
    return this.http.get<AdminEntreprise[]>(`${this.baseUrl}/admin/entreprises`);
  }

  toggleUserStatus(id: string): Observable<{ message: string, isActive: boolean }> {
    return this.http.patch<{ message: string, isActive: boolean }>(`${this.baseUrl}/admin/users/${id}/status`, {});
  }

  getCandidatApplications(candidatId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/candidats/${candidatId}/candidatures`);
  }

  getEntrepriseOffres(entrepriseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/entreprises/${entrepriseId}/offres`);
  }
}
