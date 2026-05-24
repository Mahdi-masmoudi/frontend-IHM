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
    id: string;
    role: Role;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface AuthProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  candidat?: CandidatProfile;
  entreprise?: EntrepriseProfile;
}

export interface Offre {
  idOffre: string;
  entreprise_id?: string;
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
  idCandidature: string;
  candidat_id?: string;
  offre_id?: string;
  candidatId?: string;
  offreId?: string;
  cv_id?: string | null;
  lettre_id?: string | null;
  cvId?: string | null;
  lettreId?: string | null;
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
  idCV: string;
  nomFichier: string;
  dateAjout: string;
}

export interface LettreMotivation {
  idLettre: string;
  contenu: string;
  dateAjout: string;
}

export interface CandidatProfile {
  userId: string;
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
  userId: string;
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
