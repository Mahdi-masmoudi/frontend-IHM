import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offre } from '../../shared/models/types';

interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
}

export interface AdminCandidat {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  niveauEtude: string;
  experience: number;
}

export interface AdminEntreprise {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  nomEntreprise: string;
  adresseEntreprise: string;
  secteurActivite: string;
  description: string;
  logo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/admin/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${id}`);
  }

  listOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.baseUrl}/admin/offres`);
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/offres/${id}`);
  }

  listCandidats(): Observable<AdminCandidat[]> {
    return this.http.get<AdminCandidat[]>(`${this.baseUrl}/admin/candidats`);
  }

  listEntreprises(): Observable<AdminEntreprise[]> {
    return this.http.get<AdminEntreprise[]>(`${this.baseUrl}/admin/entreprises`);
  }
}
