import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
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
  selectedRole = signal<'CANDIDAT' | 'ENTREPRISE'>('CANDIDAT');

  // CV Prefill State for Candidates
  cvFile = signal<File | null>(null);
  cvDragOver = signal(false);
  cvAnalyzing = signal(false);
  cvPrefilled = signal(false);

  // Candidate Form including optional progressive fields
  candidatForm = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmMotDePasse: ['', [Validators.required]],
    
    // Extra fields prefilled by CV or filled manually
    telephone: [''],
    adresse: [''],
    niveauEtude: [''],
    experience: [0, [Validators.min(0)]],
    competencesText: [''],
    languesText: [''],
    experienceDescription: ['']
  });

  // Recruiter Form
  entrepriseForm = this.fb.nonNullable.group({
    nomEntreprise: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmMotDePasse: ['', [Validators.required]]
  });

  niveauOptions = ['Baccalauréat', 'Bac+2', 'Licence (Bac+3)', 'Master (Bac+5)', 'Ingénieur (Bac+5)', 'Doctorat'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  get passwordsMatch(): boolean {
    if (this.selectedRole() === 'CANDIDAT') {
      const val = this.candidatForm.value;
      return val.motDePasse === val.confirmMotDePasse;
    } else {
      const val = this.entrepriseForm.value;
      return val.motDePasse === val.confirmMotDePasse;
    }
  }

  selectRole(role: 'CANDIDAT' | 'ENTREPRISE'): void {
    this.selectedRole.set(role);
    this.error.set(null);
  }

  // CV Upload Prefilling logic
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
      this.handleCvPrefill(files[0]);
    }
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleCvPrefill(input.files[0]);
    }
  }

  handleCvPrefill(file: File): void {
    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      this.error.set('Seuls les fichiers PDF et DOCX sont acceptés.');
      return;
    }

    this.cvFile.set(file);
    this.cvAnalyzing.set(true);
    this.error.set(null);

    // Styling AI spinner cooldown (2.5 seconds)
    setTimeout(() => {
      this.cvAnalyzing.set(false);
      this.cvPrefilled.set(true);

      // Prepopulate form with Tunisian profile details
      this.candidatForm.patchValue({
        nom: 'Gharbi',
        prenom: 'Yassine',
        email: 'yassine.gharbi@gmail.com',
        telephone: '23456789',
        adresse: 'Lac I, Tunis',
        niveauEtude: 'Ingénieur (Bac+5)',
        experience: 3,
        competencesText: 'Angular, React, JavaScript, HTML/CSS, API REST, Node.js, Git',
        languesText: 'Français (Courant), Anglais (Technique), Arabe (Maternelle)',
        experienceDescription: `Expérience sur des applications web sur mesure avec gestion de base de données, interfaces utilisateurs responsives, et mise en ligne sur des serveurs cloud (comme Vercel, Netlify)
Freelance | full-stack
Développement Front-End de modules ERP cliniques
Conception et développement de modules ERP : gestion des patients, pharmacie, paramétrage. Collaboration avec l’équipe backend via API REST pour l’intégration et la synchronisation des données. Participation aux méthodologies Agile/Scrum : sprints, réunions quotidiennes, revues de fonctionnalités. Technologies : Angular, React, JavaScript, HTML/CSS, API REST.
Création de deux sites web professionnels
Site institutionnel pour deux sociétés avec : Espace de réclamation en ligne. Systèm`
      });
    }, 2500);
  }

  discardCvPrefill(): void {
    this.cvFile.set(null);
    this.cvPrefilled.set(false);
    this.candidatForm.reset();
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    let payload: AuthRegisterRequest;

    if (this.selectedRole() === 'CANDIDAT') {
      this.candidatForm.markAllAsTouched();
      if (this.candidatForm.invalid || !this.passwordsMatch) {
        this.loading.set(false);
        return;
      }
      const val = this.candidatForm.getRawValue();
      payload = {
        role: 'CANDIDAT',
        nom: val.nom,
        prenom: val.prenom,
        email: val.email,
        motDePasse: val.motDePasse,
        telephone: val.telephone || '',
        adresse: val.adresse || '',
        niveauEtude: val.niveauEtude || '',
        experience: val.experience || 0,
        competences: val.competencesText ? val.competencesText.split(',').map(s => s.trim()).filter(Boolean) : [],
        langues: val.languesText ? val.languesText.split(',').map(s => s.trim()).filter(Boolean) : [],
        experienceDescription: val.experienceDescription || ''
      };
    } else {
      this.entrepriseForm.markAllAsTouched();
      if (this.entrepriseForm.invalid || !this.passwordsMatch) {
        this.loading.set(false);
        return;
      }
      const val = this.entrepriseForm.getRawValue();
      payload = {
        role: 'ENTREPRISE',
        nom: val.nomEntreprise,
        prenom: '',
        email: val.email,
        motDePasse: val.motDePasse,
        telephone: '',
        nomEntreprise: val.nomEntreprise
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
