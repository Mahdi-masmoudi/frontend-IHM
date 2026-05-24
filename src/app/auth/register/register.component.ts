import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
import { CandidatService, CvAnalyseResult } from '../../core/services/candidat.service';
import { AuthRegisterRequest, Role } from '../../shared/models/types';

@Component({
  selector: 'app-auth-register',
  imports: [SharedModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  currentStep = signal(1);
  selectedRole = signal<'CANDIDAT' | 'ENTREPRISE'>('CANDIDAT');

  // CV Analysis
  cvFile = signal<File | null>(null);
  cvAnalyzing = signal(false);
  cvAnalysisResult = signal<CvAnalyseResult | null>(null);
  cvDragOver = signal(false);

  // Step 1 - Basic Info
  step1Form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmMotDePasse: ['', [Validators.required]]
  });

  // Step 2 - Candidat Profile
  step2Form = this.fb.nonNullable.group({
    adresse: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    niveauEtude: ['', [Validators.required]],
    experience: [0, [Validators.required, Validators.min(0)]]
  });

  // Step 2 - Entreprise Profile
  step2EntrepriseForm = this.fb.nonNullable.group({
    nomEntreprise: ['', [Validators.required]],
    adresseEntreprise: ['', [Validators.required]],
    secteurActivite: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]]
  });

  niveauOptions = ['Baccalauréat', 'Bac+2', 'Licence (Bac+3)', 'Master (Bac+5)', 'Ingénieur (Bac+5)', 'Doctorat'];
  secteurOptions = ['Technologies', 'Finance', 'Santé', 'Éducation', 'Industrie', 'Commerce', 'Énergie', 'Ressources Humaines', 'Data & Analytics', 'Conseil', 'Autre'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  get totalSteps(): number {
    return this.selectedRole() === 'CANDIDAT' ? 3 : 2;
  }

  get progressPercent(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  get passwordsMatch(): boolean {
    return this.step1Form.value.motDePasse === this.step1Form.value.confirmMotDePasse;
  }

  selectRole(role: 'CANDIDAT' | 'ENTREPRISE'): void {
    this.selectedRole.set(role);
    this.currentStep.set(1);
    this.error.set(null);
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      this.step1Form.markAllAsTouched();
      if (this.step1Form.invalid || !this.passwordsMatch) return;
    }
    if (this.currentStep() === 2 && this.selectedRole() === 'CANDIDAT') {
      this.step2Form.markAllAsTouched();
      if (this.step2Form.invalid) return;
    }
    if (this.currentStep() === 2 && this.selectedRole() === 'ENTREPRISE') {
      this.step2EntrepriseForm.markAllAsTouched();
      if (this.step2EntrepriseForm.invalid) return;
    }
    this.error.set(null);
    this.currentStep.update(s => Math.min(s + 1, this.totalSteps));
  }

  prevStep(): void {
    this.currentStep.update(s => Math.max(s - 1, 1));
    this.error.set(null);
  }

  onCvDragOver(event: DragEvent): void {
    event.preventDefault();
    this.cvDragOver.set(true);
  }

  onCvDragLeave(): void {
    this.cvDragOver.set(false);
  }

  onCvDrop(event: DragEvent): void {
    event.preventDefault();
    this.cvDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleCvFile(files[0]);
    }
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleCvFile(input.files[0]);
    }
  }

  handleCvFile(file: File): void {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      this.error.set('Seuls les fichiers PDF et DOCX sont acceptés');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error.set('Le fichier ne doit pas dépasser 10 Mo');
      return;
    }
    this.cvFile.set(file);
    this.error.set(null);
  }

  removeCvFile(): void {
    this.cvFile.set(null);
    this.cvAnalysisResult.set(null);
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    const step1 = this.step1Form.getRawValue();
    let payload: AuthRegisterRequest;

    if (this.selectedRole() === 'CANDIDAT') {
      const step2 = this.step2Form.getRawValue();
      payload = {
        role: 'CANDIDAT',
        nom: step1.nom,
        prenom: step1.prenom,
        email: step1.email,
        motDePasse: step1.motDePasse,
        telephone: step1.telephone,
        adresse: step2.adresse,
        dateNaissance: step2.dateNaissance,
        niveauEtude: step2.niveauEtude,
        experience: step2.experience
      };
    } else {
      const step2e = this.step2EntrepriseForm.getRawValue();
      payload = {
        role: 'ENTREPRISE',
        nom: step1.nom,
        prenom: step1.prenom,
        email: step1.email,
        motDePasse: step1.motDePasse,
        telephone: step1.telephone,
        nomEntreprise: step2e.nomEntreprise,
        adresseEntreprise: step2e.adresseEntreprise,
        secteurActivite: step2e.secteurActivite,
        description: step2e.description
      };
    }

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.navigateByRole(response.user.role as Role);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }

  private navigateByRole(role: Role): void {
    if (role === 'CANDIDAT') {
      this.router.navigate(['/candidat/dashboard']);
      return;
    }
    if (role === 'ENTREPRISE') {
      this.router.navigate(['/entreprise/dashboard']);
      return;
    }
    this.router.navigate(['/admin/dashboard']);
  }
}
