import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { CandidatProfile, Cv, LettreMotivation, Offre, PaginatedResult, Role } from '../../shared/models/types';
import { CandidatService } from '../../core/services/candidat.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-offres-list',
  imports: [SharedModule],
  templateUrl: './offres-list.component.html',
  styleUrls: ['./offres-list.component.scss']
})
export class OffresListComponent implements OnInit {
  offres = signal<Offre[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 10;
  error = signal<string | null>(null);
  loading = signal(false);
  showApplyModal = signal(false);
  selectedOffre = signal<Offre | null>(null);
  cvs = signal<Cv[]>([]);
  lettres = signal<LettreMotivation[]>([]);
  role = signal<Role | null>(null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  filterForm = this.fb.nonNullable.group({
    q: '',
    typeContrat: '',
    localisation: '',
    statut: '',
    entreprise: '',
    salaireMin: '',
    salaireMax: '',
    sortBy: 'datePublication',
    sortDirection: 'desc'
  });

  applyForm = this.fb.nonNullable.group({
    cvId: [0, [Validators.min(1)]],
    lettreId: [0, [Validators.min(1)]],
    commentaire: ''
  });

  constructor(
    private fb: FormBuilder,
    private offresService: OffresService,
    private candidaturesService: CandidaturesService,
    private candidatService: CandidatService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.role.set(this.tokenService.getRole());
    this.load();
    if (this.role() === 'CANDIDAT') {
      this.loadCandidatAssets();
    }
  }

  load(page = 1): void {
    this.page.set(page);
    const filters = this.filterForm.value;
    this.loading.set(true);
    this.offresService
      .list({
        q: filters.q || undefined,
        typeContrat: filters.typeContrat || undefined,
        localisation: filters.localisation || undefined,
        statut: filters.statut || undefined,
        entreprise: filters.entreprise || undefined,
        salaireMin: filters.salaireMin ? Number(filters.salaireMin) : undefined,
        salaireMax: filters.salaireMax ? Number(filters.salaireMax) : undefined,
        sortBy: (filters.sortBy as 'datePublication' | 'salaire') || 'datePublication',
        sortDirection: (filters.sortDirection as 'asc' | 'desc') || 'desc',
        page: this.page(),
        pageSize: this.pageSize
      })
      .subscribe({
        next: (result: PaginatedResult<Offre>) => {
          this.offres.set(result.items);
          this.total.set(result.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erreur lors du chargement des offres');
          this.loading.set(false);
        }
      });
  }

  loadCandidatAssets(): void {
    this.candidatService.getProfile().subscribe({
      next: (profile: CandidatProfile) => {
        this.cvs.set(profile.cvs || []);
        this.lettres.set(profile.lettres || []);
      },
      error: () => {
        this.error.set('Impossible de charger les informations candidat');
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      q: '',
      typeContrat: '',
      localisation: '',
      statut: '',
      entreprise: '',
      salaireMin: '',
      salaireMax: '',
      sortBy: 'datePublication',
      sortDirection: 'desc'
    });
    this.load(1);
  }

  openApply(offre: Offre): void {
    if (this.role() !== 'CANDIDAT') {
      return;
    }
    this.selectedOffre.set(offre);
    const firstCv = this.cvs()[0];
    const firstLettre = this.lettres()[0];
    this.applyForm.reset({
      cvId: firstCv ? firstCv.idCV : 0,
      lettreId: firstLettre ? firstLettre.idLettre : 0,
      commentaire: ''
    });
    this.showApplyModal.set(true);
  }

  closeApply(): void {
    this.showApplyModal.set(false);
    this.selectedOffre.set(null);
  }

  submitApply(): void {
    if (this.applyForm.invalid || !this.selectedOffre()) {
      this.applyForm.markAllAsTouched();
      return;
    }

    const payload = this.applyForm.getRawValue();
    this.candidaturesService
      .apply(this.selectedOffre()!.idOffre, payload.cvId, payload.lettreId, payload.commentaire)
      .subscribe({
        next: () => {
          this.error.set(null);
          this.closeApply();
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Impossible de postuler');
        }
      });
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.load(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.load(this.page() + 1);
    }
  }
}
