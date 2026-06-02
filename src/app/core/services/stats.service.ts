import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GlobalStats {
  totalUsers: number;
  totalCandidats: number;
  totalEntreprises: number;
  totalOffres: number;
  totalCandidatures: number;
  offresActives: number;
  candidaturesEnAttente: number;
  candidaturesAcceptees: number;
  candidaturesRejetees: number;
  topEntreprises: { nomEntreprise: string; secteurActivite: string; logo: string | null; offresCount: number }[];
  recentOffres: any[];
  offresByType: { typeContrat: string; count: number }[];
  candidaturesByMonth: { month: string; count: number }[];
}

export interface ProfileSuggestion {
  field: string;
  message: string;
  points: number;
}

export interface CandidatStats {
  totalCandidatures: number;
  enAttente: number;
  acceptees: number;
  rejetees: number;
  totalCvs: number;
  totalLettres: number;
  recentCandidatures: any[];
  profileCompletion: number;
  suggestions: ProfileSuggestion[];
  niveau: string;
}

export interface EntrepriseStats {
  totalOffres: number;
  offresActives: number;
  totalCandidatures: number;
  enAttente: number;
  acceptees: number;
  recentCandidatures: any[];
  candidaturesByOffre: { titre: string; count: number }[];
  profileCompletion: number;
  suggestions: ProfileSuggestion[];
  niveau: string;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getGlobalStats(): Observable<GlobalStats> {
    return this.http.get<GlobalStats>(`${this.baseUrl}/stats/global`);
  }

  getCandidatStats(): Observable<CandidatStats> {
    return this.http.get<CandidatStats>(`${this.baseUrl}/stats/candidat`);
  }

  getEntrepriseStats(): Observable<EntrepriseStats> {
    return this.http.get<EntrepriseStats>(`${this.baseUrl}/stats/entreprise`);
  }
}
