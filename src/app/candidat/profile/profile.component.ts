import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidatService } from '../../core/services/candidat.service';
import { CandidatProfile } from '../../shared/models/types';

@Component({
  selector: 'app-candidat-profile',
  imports: [SharedModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile = signal<CandidatProfile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedFile: File | null = null;

  profileForm = this.fb.nonNullable.group({
    adresse: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    niveauEtude: ['', [Validators.required]],
    experience: [0, [Validators.required, Validators.min(0)]]
  });

  lettreForm = this.fb.nonNullable.group({
    contenu: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private candidatService: CandidatService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.candidatService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          adresse: profile.adresse,
          dateNaissance: profile.dateNaissance,
          niveauEtude: profile.niveauEtude,
          experience: profile.experience
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Erreur lors du chargement du profil');
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.candidatService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (profile) => {
        this.profile.set(profile);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Mise a jour impossible');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadCv(): void {
    if (!this.selectedFile) {
      return;
    }

    this.candidatService.uploadCv(this.selectedFile).subscribe({
      next: () => {
        this.selectedFile = null;
        this.loadProfile();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de l\'upload du CV');
      }
    });
  }

  addLettre(): void {
    if (this.lettreForm.invalid) {
      this.lettreForm.markAllAsTouched();
      return;
    }

    this.candidatService.addLettre(this.lettreForm.getRawValue().contenu).subscribe({
      next: () => {
        this.lettreForm.reset();
        this.loadProfile();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de l\'ajout de la lettre');
      }
    });
  }
}
