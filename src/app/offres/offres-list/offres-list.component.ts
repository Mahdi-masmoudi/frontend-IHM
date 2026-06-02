import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { CandidatProfile, Candidature, Cv, LettreMotivation, Offre, PaginatedResult, Role } from '../../shared/models/types';
import { CandidatService } from '../../core/services/candidat.service';
import { TokenService } from '../../core/services/token.service';
import { ActivatedRoute } from '@angular/router';

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
  myCandidatures = signal<Candidature[]>([]);
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
    cvId: ['', [Validators.required]],
    lettreId: ['', [Validators.required]],
    commentaire: ''
  });

  constructor(
    private fb: FormBuilder,
    private offresService: OffresService,
    private candidaturesService: CandidaturesService,
    private candidatService: CandidatService,
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.role.set(this.tokenService.getRole());

    this.route.queryParams.subscribe(params => {
      if (params['q'] || params['localisation'] || params['entreprise']) {
        this.filterForm.patchValue({
          q: params['q'] || '',
          localisation: params['localisation'] || '',
          entreprise: params['entreprise'] || ''
        });
      }
      this.load();
    });

    if (this.role() === 'CANDIDAT') {
      this.loadCandidatAssets();
    }
  }

  load(page = 1): void {
    this.page.set(page);
    const filters = this.filterForm.value;
    this.loading.set(true);
    this.error.set(null);

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
          this.offres.set(result.items || []);
          this.total.set(result.total || 0);
          this.loading.set(false);
        },
        error: () => {
          this.offres.set([]);
          this.total.set(0);
          this.loading.set(false);
          this.error.set('Impossible de charger les offres. Veuillez réessayer.');
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

    this.candidaturesService.listMine().subscribe({
      next: (candidatures: Candidature[]) => {
        this.myCandidatures.set(candidatures || []);
      }
    });
  }

  hasApplied(offreId: string): boolean {
    return this.myCandidatures().some(c => c.offreId === offreId);
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
      cvId: firstCv ? firstCv.idCV : '',
      lettreId: firstLettre ? firstLettre.idLettre : '',
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
          this.loadCandidatAssets();
          this.load(this.page());
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Impossible de postuler');
        }
      });
  }

  getDaysAgo(dateString: string): string {
    const pubDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return '1 jour';
    return `${diffDays} jours`;
  }

  getLettrePreview(contenu: string): string {
    if (!contenu) return 'Lettre sans contenu';
    const firstLine = contenu.split('\n')[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...';
    }
    return firstLine || 'Lettre de motivation';
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
