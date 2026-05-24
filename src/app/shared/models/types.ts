export type Role = 'SUPER_ADMIN' | 'CANDIDAT' | 'ENTREPRISE';

export interface AuthLoginRequest {
  email: string;
  motDePasse: string;
}

export interface AuthRegisterRequest {
  role: Role;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse?: string;
  dateNaissance?: string;
  niveauEtude?: string;
  experience?: number;
  nomEntreprise?: string;
  adresseEntreprise?: string;
  secteurActivite?: string;
  description?: string;
  logo?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    role: Role;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface AuthProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  candidat?: CandidatProfile;
  entreprise?: EntrepriseProfile;
}

export interface Offre {
  idOffre: number;
  entreprise_id?: number;
  titre: string;
  description: string;
  typeContrat: string;
  salaire: number;
  localisation: string;
  datePublication: string;
  statut: string;
  competences?: string | null;
  experienceDemandee?: number | null;
  nomEntreprise?: string;
  adresseEntreprise?: string;
  secteurActivite?: string;
  entrepriseDescription?: string;
  logo?: string | null;
  candidaturesCount?: number;
}

export interface Candidature {
  idCandidature: number;
  candidat_id?: number;
  offre_id?: number;
  candidatId?: number;
  offreId?: number;
  cv_id?: number | null;
  lettre_id?: number | null;
  cvId?: number | null;
  lettreId?: number | null;
  datePostulation: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE';
  commentaire?: string | null;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  titre?: string;
  nomEntreprise?: string;
  localisation?: string;
  typeContrat?: string;
  salaire?: number;
  datePublication?: string;
  cvNomFichier?: string | null;
  lettreContenu?: string | null;
}

export interface Cv {
  idCV: number;
  nomFichier: string;
  dateAjout: string;
}

export interface LettreMotivation {
  idLettre: number;
  contenu: string;
  dateAjout: string;
}

export interface CandidatProfile {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  niveauEtude: string;
  experience: number;
  cvs: Cv[];
  lettres: LettreMotivation[];
}

export interface EntrepriseProfile {
  userId: number;
  nomEntreprise: string;
  adresseEntreprise: string;
  secteurActivite: string;
  description: string;
  logo?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
