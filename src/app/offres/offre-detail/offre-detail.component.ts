import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { CandidatService } from '../../core/services/candidat.service';
import { TokenService } from '../../core/services/token.service';
import { CandidatProfile, Candidature, Cv, LettreMotivation, Offre, Role } from '../../shared/models/types';

@Component({
  selector: 'app-offre-detail',
  imports: [SharedModule],
  templateUrl: './offre-detail.component.html',
  styleUrls: ['./offre-detail.component.scss']
})
export class OffreDetailComponent implements OnInit {
  offre = signal<Offre | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  role = signal<Role | null>(null);
  cvs = signal<Cv[]>([]);
  lettres = signal<LettreMotivation[]>([]);
  showApplyModal = signal(false);
  similarOffres = signal<Offre[]>([]);
  myCandidatures = signal<Candidature[]>([]);

  applyForm = this.fb.nonNullable.group({
    cvId: ['', [Validators.required]],
    lettreId: ['', [Validators.required]],
    commentaire: ''
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private offresService: OffresService,
    private candidaturesService: CandidaturesService,
    private candidatService: CandidatService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.role.set(this.tokenService.getRole());
    
    // Subscribe to param changes to reload when clicking on a similar job!
    this.route.paramMap.subscribe(params => {
      const idOffre = params.get('id') || '';
      if (idOffre) {
        this.loadOffre(idOffre);
      } else {
        this.loading.set(false);
        this.error.set('Offre introuvable');
      }
    });

    if (this.role() === 'CANDIDAT') {
      this.loadCandidatAssets();
    }
  }

  loadOffre(id: string): void {
    this.loading.set(true);
    this.offresService.getById(id).subscribe({
      next: (offre) => {
        this.offre.set(offre);
        this.loading.set(false);
        this.loadSimilarOffres(offre);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Erreur lors du chargement de l\'offre');
      }
    });
  }

  loadSimilarOffres(offre: Offre): void {
    const searchKeyword = (offre.competences || '').split(',')[0]?.trim() || offre.titre.split(' ')[0];
    this.offresService.list({ page: 1, pageSize: 4, q: searchKeyword }).subscribe({
      next: (res) => {
        let filtered = (res.items || []).filter(item => item.idOffre !== offre.idOffre);
        if (filtered.length === 0) {
          // Fetch latest jobs as fallback
          this.offresService.list({ page: 1, pageSize: 4 }).subscribe({
            next: (fallbackRes) => {
              this.similarOffres.set((fallbackRes.items || []).filter(item => item.idOffre !== offre.idOffre).slice(0, 3));
            }
          });
        } else {
          this.similarOffres.set(filtered.slice(0, 3));
        }
      }
    });
  }

  loadCandidatAssets(): void {
    this.candidatService.getProfile().subscribe({
      next: (profile: CandidatProfile) => {
        this.cvs.set(profile.cvs || []);
        this.lettres.set(profile.lettres || []);
      }
    });

    this.candidaturesService.listMine().subscribe({
      next: (candidatures) => {
        this.myCandidatures.set(candidatures || []);
      }
    });
  }

  hasApplied(offreId: string): boolean {
    return this.myCandidatures().some(c => c.offreId === offreId);
  }

  getLettrePreview(contenu: string): string {
    if (!contenu) return 'Lettre sans contenu';
    const firstLine = contenu.split('\n')[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...';
    }
    return firstLine || 'Lettre de motivation';
  }

  openApply(): void {
    if (this.role() !== 'CANDIDAT') {
      return;
    }
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
  }

  submitApply(): void {
    if (this.applyForm.invalid || !this.offre()) {
      this.applyForm.markAllAsTouched();
      return;
    }

    const payload = this.applyForm.getRawValue();
    this.candidaturesService
      .apply(this.offre()!.idOffre, payload.cvId, payload.lettreId, payload.commentaire)
      .subscribe({
        next: () => {
          this.closeApply();
          this.loadCandidatAssets();
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Impossible de postuler');
        }
      });
  }
}
