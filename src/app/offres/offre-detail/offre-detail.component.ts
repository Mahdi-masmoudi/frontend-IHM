import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { CandidatService } from '../../core/services/candidat.service';
import { TokenService } from '../../core/services/token.service';
import { CandidatProfile, Cv, LettreMotivation, Offre, Role } from '../../shared/models/types';

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

  applyForm = this.fb.nonNullable.group({
    cvId: [0, [Validators.min(1)]],
    lettreId: [0, [Validators.min(1)]],
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
    const idParam = this.route.snapshot.paramMap.get('id');
    const idOffre = idParam ? Number.parseInt(idParam, 10) : 0;
    if (idOffre) {
      this.loadOffre(idOffre);
    } else {
      this.loading.set(false);
      this.error.set('Offre introuvable');
    }

    if (this.role() === 'CANDIDAT') {
      this.loadCandidatAssets();
    }
  }

  loadOffre(id: number): void {
    this.loading.set(true);
    this.offresService.getById(id).subscribe({
      next: (offre) => {
        this.offre.set(offre);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Erreur lors du chargement de l\'offre');
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
  }

  openApply(): void {
    if (this.role() !== 'CANDIDAT') {
      return;
    }
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
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Impossible de postuler');
        }
      });
  }
}
