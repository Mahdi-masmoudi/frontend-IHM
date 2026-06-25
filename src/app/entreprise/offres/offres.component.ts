import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { Offre, Candidature } from '../../shared/models/types';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entreprise-offres',
  imports: [SharedModule, RouterModule],
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.scss']
})
export class OffresComponent implements OnInit {
  offres = signal<Offre[]>([]);
  error = signal<string | null>(null);
  Math = Math;
  loading = signal(false);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedOffres = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.offres().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.offres().length / this.itemsPerPage));

  // Expand sub-table
  expandedOffreId = signal<string | null>(null);
  offreCandidatures = signal<Candidature[]>([]);
  candidaturesLoading = signal(false);

  constructor(
    private offresService: OffresService,
    private candidaturesService: CandidaturesService
  ) {}

  get totalCount(): number {
    return this.offres().length;
  }
  get activeCount(): number {
    return this.offres().filter(o => o.statut === 'ACTIVE').length;
  }
  get totalCandidaturesCount(): number {
    return this.offres().reduce((acc, curr) => acc + (curr.candidaturesCount || 0), 0);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.offresService.list({ mine: true, page: 1, pageSize: 500 }).subscribe({
      next: (result) => {
        this.offres.set(result.items);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
        this.loading.set(false);
      }
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleExpanded(offreId: string): void {
    if (this.expandedOffreId() === offreId) {
      this.expandedOffreId.set(null);
      this.offreCandidatures.set([]);
    } else {
      this.expandedOffreId.set(offreId);
      this.candidaturesLoading.set(true);
      this.offreCandidatures.set([]);
      this.candidaturesService.listByOffre(offreId).subscribe({
        next: (cands) => {
          this.offreCandidatures.set(cands);
          this.candidaturesLoading.set(false);
        },
        error: () => {
          this.error.set('Erreur chargement candidatures');
          this.candidaturesLoading.set(false);
        }
      });
    }
  }

  remove(id: string): void {
    if (!confirm('Supprimer cette offre ?')) return;

    this.offresService.remove(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.error?.message || 'Impossible de supprimer')
    });
  }

  getCvUrl(filename: string): string {
    return `${environment.apiBaseUrl}/uploads/${filename}`;
  }

  // Candidature Modal
  selectedCandidature = signal<Candidature | null>(null);

  openCandidateModal(cand: Candidature): void {
    this.selectedCandidature.set(cand);
  }

  closeCandidateModal(): void {
    this.selectedCandidature.set(null);
  }
}
