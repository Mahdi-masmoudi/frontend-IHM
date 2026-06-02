import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { OffresService } from '../../core/services/offres.service';
import { Candidature, Offre } from '../../shared/models/types';

@Component({
  selector: 'app-candidatures-offre',
  imports: [SharedModule],
  templateUrl: './candidatures-offre.component.html',
  styleUrls: ['./candidatures-offre.component.scss']
})
export class CandidaturesOffreComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  jobOffer = signal<Offre | null>(null);
  error = signal<string | null>(null);
  offreId: string | null = null;
  expandedCandidatureId = signal<string | null>(null);
  searchQuery = signal<string>('');

  constructor(
    private route: ActivatedRoute, 
    private candidaturesService: CandidaturesService,
    private offresService: OffresService
  ) {}

  toggleDetails(id: string): void {
    this.expandedCandidatureId.set(this.expandedCandidatureId() === id ? null : id);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.offreId = idParam;
    this.load();
    this.loadOffreDetails();
  }

  load(): void {
    if (!this.offreId) {
      return;
    }
    this.candidaturesService.listByOffre(this.offreId).subscribe({
      next: (result) => {
        this.candidatures.set(result);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des candidatures');
      }
    });
  }

  loadOffreDetails(): void {
    if (!this.offreId) {
      return;
    }
    this.offresService.getById(this.offreId).subscribe({
      next: (offre) => {
        this.jobOffer.set(offre);
      },
      error: () => {
        console.error('Erreur lors du chargement des détails du poste.');
      }
    });
  }

  accept(id: string): void {
    this.candidaturesService.accept(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Action impossible')
    });
  }

  reject(id: string): void {
    this.candidaturesService.reject(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Action impossible')
    });
  }

  statusClass(statut: string): string {
    if (statut === 'ACCEPTEE') {
      return 'badge bg-success';
    }
    if (statut === 'REJETEE') {
      return 'badge bg-danger';
    }
    return 'badge bg-warning text-dark';
  }

  get filteredCandidatures(): Candidature[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.candidatures();
    }
    return this.candidatures().filter(c => {
      const nomComplet = `${c.nom || ''} ${c.prenom || ''}`.toLowerCase();
      const prenomComplet = `${c.prenom || ''} ${c.nom || ''}`.toLowerCase();
      const email = (c.email || '').toLowerCase();
      const competences = c.competences || [];
      const experience = c.experience != null ? `${c.experience} ans` : 'débutant';
      const niveauEtude = (c.niveauEtude || '').toLowerCase();
      
      return nomComplet.includes(query) ||
             prenomComplet.includes(query) ||
             email.includes(query) ||
             niveauEtude.includes(query) ||
             experience.includes(query) ||
             competences.some(s => s.toLowerCase().includes(query));
    });
  }
}

