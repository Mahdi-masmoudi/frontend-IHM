import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { StatsService, CandidatStats, ProfileSuggestion } from '../../core/services/stats.service';
import { AuthService } from '../../core/services/auth.service';
import { CandidatService } from '../../core/services/candidat.service';
import { AuthProfile, CandidatProfile } from '../../shared/models/types';

@Component({
  selector: 'app-candidat-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<CandidatStats | null>(null);
  profile = signal<AuthProfile | null>(null);
  candidatProfile = signal<CandidatProfile | null>(null);
  loading = signal(true);

  // Onboarding Widget State
  activeOnboardingField = signal<string | null>(null);
  onboardingLoading = signal(false);
  onboardingSuccess = signal<string | null>(null);

  // Onboarding Form
  onboardingForm = this.fb.group({
    telephone: ['', [Validators.pattern(/^\d{10}$/)]],
    adresse: [''],
    dateNaissance: [''],
    niveauEtude: [''],
    experience: [0, [Validators.min(0)]],
    newCompetence: [''],
    newLangue: ['']
  });

  // CV Analysis State
  cvFile = signal<File | null>(null);
  cvDragOver = signal(false);
  cvAnalyzing = signal(false);
  cvAnalyseData = signal<any | null>(null);

  niveauOptions = ['Baccalauréat', 'Bac+2', 'Licence (Bac+3)', 'Master (Bac+5)', 'Ingénieur (Bac+5)', 'Doctorat'];

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private candidatService: CandidatService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.authService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.onboardingForm.patchValue({
          telephone: p.telephone || ''
        });
      },
      error: () => {}
    });

    this.candidatService.getProfile().subscribe({
      next: (cp) => {
        this.candidatProfile.set(cp);
        this.onboardingForm.patchValue({
          adresse: cp.adresse || '',
          dateNaissance: cp.dateNaissance || '',
          niveauEtude: cp.niveauEtude || '',
          experience: cp.experience || 0
        });
      }
    });

    this.statsService.getCandidatStats().subscribe({
      next: (s) => {
        const oldNiveau = this.stats()?.niveau;
        this.stats.set(s);
        this.loading.set(false);

        // If level improved, trigger confetti!
        if (oldNiveau && s.niveau !== oldNiveau) {
          this.triggerConfetti();
        }

        // Set first missing field as active onboarding step
        if (s.suggestions && s.suggestions.length > 0 && !this.activeOnboardingField()) {
          this.activeOnboardingField.set(s.suggestions[0].field);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  setActiveField(field: string): void {
    this.activeOnboardingField.set(field);
    this.onboardingSuccess.set(null);
  }

  saveOnboardingField(field: string): void {
    this.onboardingLoading.set(true);
    this.onboardingSuccess.set(null);

    const values = this.onboardingForm.value;
    const payload: Partial<CandidatProfile> = {};

    if (field === 'telephone') {
      payload.telephone = values.telephone || '';
    } else if (field === 'adresse') {
      payload.adresse = values.adresse || '';
    } else if (field === 'dateNaissance') {
      payload.dateNaissance = values.dateNaissance || '';
    } else if (field === 'niveauEtude') {
      payload.niveauEtude = values.niveauEtude || '';
    } else if (field === 'experience') {
      payload.experience = values.experience || 0;
    } else if (field === 'competences' && values.newCompetence) {
      const current = this.candidatProfile()?.competences || [];
      payload.competences = [...current, values.newCompetence.trim()];
    } else if (field === 'langues' && values.newLangue) {
      const current = this.candidatProfile()?.langues || [];
      payload.langues = [...current, values.newLangue.trim()];
    }

    this.candidatService.updateProfile(payload).subscribe({
      next: () => {
        this.onboardingLoading.set(false);
        this.onboardingSuccess.set('Enregistré avec succès !');
        this.onboardingForm.patchValue({
          newCompetence: '',
          newLangue: ''
        });
        
        // Reset active field or set next missing field
        setTimeout(() => {
          this.activeOnboardingField.set(null);
          this.loadData();
        }, 1200);
      },
      error: () => {
        this.onboardingLoading.set(false);
      }
    });
  }

  // Simulated CV analysis
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
      this.handleCvUpload(files[0]);
    }
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleCvUpload(input.files[0]);
    }
  }

  handleCvUpload(file: File): void {
    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      alert('Seuls les fichiers PDF et DOCX sont acceptés.');
      return;
    }

    this.cvFile.set(file);
    this.cvAnalyzing.set(true);

    // Call actual backend parser
    this.candidatService.uploadCvAnalyse(file).subscribe({
      next: (res) => {
        // AI loader styling cooldown of 2.5 seconds to wow the user
        setTimeout(() => {
          this.cvAnalyzing.set(false);
          this.cvAnalyseData.set(res.data);

          // Let's pre-fill the form with the parsed values
          this.onboardingForm.patchValue({
            telephone: res.data.telephone || this.onboardingForm.value.telephone,
            adresse: res.data.adresse || this.onboardingForm.value.adresse,
            niveauEtude: res.data.niveauEtude || this.onboardingForm.value.niveauEtude,
            experience: res.data.experience || this.onboardingForm.value.experience
          });

          // Show confirmation card to user
        }, 2500);
      },
      error: () => {
        this.cvAnalyzing.set(false);
        alert('Erreur lors du traitement du CV.');
      }
    });
  }

  applyCvAnalysis(): void {
    const data = this.cvAnalyseData();
    if (!data) return;

    this.onboardingLoading.set(true);
    const payload: Partial<CandidatProfile> = {
      telephone: data.telephone || undefined,
      adresse: data.adresse || undefined,
      niveauEtude: data.niveauEtude || undefined,
      experience: data.experience || undefined,
      competences: data.competences && data.competences.length > 0 ? data.competences : undefined,
      langues: data.langues && data.langues.length > 0 ? data.langues : undefined
    };

    // Clean up undefined properties
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    this.candidatService.updateProfile(payload).subscribe({
      next: () => {
        this.onboardingLoading.set(false);
        this.cvFile.set(null);
        this.cvAnalyseData.set(null);
        this.loadData();
      },
      error: () => {
        this.onboardingLoading.set(false);
      }
    });
  }

  discardCvAnalysis(): void {
    this.cvFile.set(null);
    this.cvAnalyseData.set(null);
  }

  // Helper colors
  getStatusColor(statut: string): string {
    switch (statut) {
      case 'ACCEPTEE': return '#10b981';
      case 'REJETEE': return '#ef4444';
      default: return '#f59e0b';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'ACCEPTEE': return 'Acceptée';
      case 'REJETEE': return 'Rejetée';
      default: return 'En attente';
    }
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'ACCEPTEE': return 'ti-circle-check';
      case 'REJETEE': return 'ti-circle-x';
      default: return 'ti-clock';
    }
  }

  getNiveauBadgeClass(niveau: string): string {
    switch (niveau) {
      case 'Superstar': return 'badge-superstar';
      case 'Expert': return 'badge-expert';
      case 'Avancé': return 'badge-avance';
      case 'Intermédiaire': return 'badge-inter';
      default: return 'badge-debutant';
    }
  }

  // Custom Confetti Burst
  triggerConfetti(): void {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#22d3ee'];
    const particles: any[] = [];

    // Left shoot
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: 0,
        y: canvas.height * 0.8,
        vx: Math.random() * 12 + 8,
        vy: -Math.random() * 20 - 10,
        r: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        spin: Math.random() * 8 - 4,
        opacity: 1
      });
    }

    // Right shoot
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: canvas.width,
        y: canvas.height * 0.8,
        vx: -Math.random() * 12 - 8,
        vy: -Math.random() * 20 - 10,
        r: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        spin: Math.random() * 8 - 4,
        opacity: 1
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        if (p.opacity <= 0) return;
        active = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();

        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // wind resistance
        p.angle += p.spin;

        if (p.vy > 0) {
          p.opacity -= 0.015;
        }
      });

      if (active) {
        requestAnimationFrame(draw);
      } else {
        document.body.removeChild(canvas);
      }
    }

    requestAnimationFrame(draw);
  }
}
