import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidatProfile, Cv, LettreMotivation } from '../../shared/models/types';

export interface CvAnalyseResult {
  success: boolean;
  data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
    competences: string[];
    experience: number;
    niveauEtude: string;
    langues: string[];
    linkedin: string;
    github: string;
    portfolio: string;
    experiences: { period: string; description: string }[];
    formations: { period: string; description: string }[];
    certifications: string[];
  };
  scoreExtraction: number;
}

@Injectable({ providedIn: 'root' })
export class CandidatService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<CandidatProfile> {
    return this.http.get<CandidatProfile>(`${this.baseUrl}/candidats/profile`);
  }

  updateProfile(payload: Partial<CandidatProfile>): Observable<CandidatProfile> {
    return this.http.put<CandidatProfile>(`${this.baseUrl}/candidats/profile`, payload);
  }

  uploadCv(file: File): Observable<Cv> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Cv>(`${this.baseUrl}/candidats/cv`, formData);
  }

  uploadCvAnalyse(file: File): Observable<CvAnalyseResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CvAnalyseResult>(`${this.baseUrl}/candidats/upload-cv-analyse`, formData);
  }

  addLettre(contenu: string): Observable<LettreMotivation> {
    return this.http.post<LettreMotivation>(`${this.baseUrl}/candidats/lettre`, { contenu });
  }
}
