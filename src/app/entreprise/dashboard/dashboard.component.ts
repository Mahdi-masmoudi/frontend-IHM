import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { OffresService } from '../../core/services/offres.service';
import { EntrepriseProfile, Offre } from '../../shared/models/types';

@Component({
  selector: 'app-entreprise-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  profile = signal<EntrepriseProfile | null>(null);
  offres = signal<Offre[]>([]);
  error = signal<string | null>(null);

  profileForm = this.fb.nonNullable.group({
    nomEntreprise: ['', [Validators.required]],
    adresseEntreprise: ['', [Validators.required]],
    secteurActivite: ['', [Validators.required]],
    description: ['', [Validators.required]],
    logo: ['']
  });

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private offresService: OffresService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadOffres();
  }

  loadProfile(): void {
    this.entrepriseService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          nomEntreprise: profile.nomEntreprise,
          adresseEntreprise: profile.adresseEntreprise,
          secteurActivite: profile.secteurActivite,
          description: profile.description,
          logo: profile.logo ?? ''
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors du chargement du profil');
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.entrepriseService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (profile) => {
        this.profile.set(profile);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Mise a jour impossible');
      }
    });
  }

  loadOffres(): void {
    this.offresService.list({ mine: true, page: 1, pageSize: 10 }).subscribe({
      next: (result) => {
        this.offres.set(result.items);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
      }
    });
  }
}
