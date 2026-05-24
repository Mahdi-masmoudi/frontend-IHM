import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { Offre } from '../../shared/models/types';

@Component({
  selector: 'app-offre-form',
  imports: [SharedModule],
  templateUrl: './offre-form.component.html',
  styleUrls: ['./offre-form.component.scss']
})
export class OffreFormComponent implements OnInit {
  error = signal<string | null>(null);
  loading = signal(false);
  offreId: number | null = null;

  form = this.fb.nonNullable.group({
    titre: ['', [Validators.required]],
    description: ['', [Validators.required]],
    typeContrat: ['', [Validators.required]],
    salaire: [0, [Validators.required, Validators.min(0)]],
    localisation: ['', [Validators.required]],
    statut: ['OUVERTE', [Validators.required]],
    competences: [''],
    experienceDemandee: [0, [Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    private offresService: OffresService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.offreId = Number.parseInt(idParam, 10);
      this.loadOffre(this.offreId);
    }
  }

  loadOffre(id: number): void {
    this.offresService.getById(id).subscribe({
      next: (offre: Offre) => {
        this.form.patchValue({
          titre: offre.titre,
          description: offre.description,
          typeContrat: offre.typeContrat,
          salaire: offre.salaire,
          localisation: offre.localisation,
          statut: offre.statut,
          competences: offre.competences ?? '',
          experienceDemandee: offre.experienceDemandee ?? 0
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors du chargement');
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue();

    const request$ = this.offreId
      ? this.offresService.update(this.offreId, payload)
      : this.offresService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/entreprise/offres']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Enregistrement impossible');
      }
    });
  }
}
