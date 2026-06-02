import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { Candidature } from '../../shared/models/types';

@Component({
  selector: 'app-entreprise-candidatures',
  imports: [SharedModule],
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss']
})
export class CandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  expandedCandidatureId = signal<string | null>(null);

  constructor(private candidaturesService: CandidaturesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.candidaturesService.listForEntreprise().subscribe({
      next: (items) => this.candidatures.set(items),
      error: () => this.error.set('Erreur lors du chargement des candidatures')
    });
  }

  toggleDetails(id: string): void {
    this.expandedCandidatureId.set(this.expandedCandidatureId() === id ? null : id);
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

  get totalCount(): number {
    return this.candidatures().length;
  }

  get pendingCount(): number {
    return this.candidatures().filter(c => c.statut === 'EN_ATTENTE').length;
  }

  get acceptedCount(): number {
    return this.candidatures().filter(c => c.statut === 'ACCEPTEE').length;
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
      const titre = (c.titre || '').toLowerCase();
      const competences = c.competences || [];
      const experience = c.experience != null ? `${c.experience} ans` : 'débutant';
      const niveauEtude = (c.niveauEtude || '').toLowerCase();
      
      return nomComplet.includes(query) ||
             prenomComplet.includes(query) ||
             email.includes(query) ||
             titre.includes(query) ||
             niveauEtude.includes(query) ||
             experience.includes(query) ||
             competences.some(s => s.toLowerCase().includes(query));
    });
  }
}

