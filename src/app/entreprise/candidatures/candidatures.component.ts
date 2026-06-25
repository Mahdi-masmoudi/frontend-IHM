import { Component, OnInit, signal, computed } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { Candidature } from '../../shared/models/types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entreprise-candidatures',
  imports: [SharedModule],
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss']
})
export class CandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  error = signal<string | null>(null);
  Math = Math;
  searchQuery = signal<string>('');
  expandedCandidatureId = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedCandidatures = computed(() => {
    const filtered = this.filteredCandidatures();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredCandidatures().length / this.itemsPerPage));

  constructor(private candidaturesService: CandidaturesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.candidaturesService.listForEntreprise().subscribe({
      next: (items) => {
        this.candidatures.set(items);
        this.currentPage.set(1);
      },
      error: () => this.error.set('Erreur lors du chargement des candidatures')
    });
  }

  getCvUrl(filename: string): string {
    return `${environment.apiBaseUrl}/uploads/cv/${filename}`;
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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



  filteredCandidatures = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let list = this.candidatures();

    if (query) {
      list = list.filter(c => {
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

    // Tri par date
    list = [...list].sort((a, b) => new Date(b.datePostulation).getTime() - new Date(a.datePostulation).getTime());

    return list;
  });
}
