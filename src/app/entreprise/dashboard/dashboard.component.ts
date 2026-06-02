import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { EntrepriseService } from '../../core/services/entreprise.service';
import { OffresService } from '../../core/services/offres.service';
import { StatsService, EntrepriseStats } from '../../core/services/stats.service';
import { EntrepriseProfile, Offre } from '../../shared/models/types';

@Component({
  selector: 'app-entreprise-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  profile = signal<EntrepriseProfile | null>(null);
  stats = signal<EntrepriseStats | null>(null);
  offres = signal<Offre[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Onboarding Widget State
  activeOnboardingField = signal<string | null>(null);
  onboardingLoading = signal(false);
  onboardingSuccess = signal<string | null>(null);

  // Onboarding Form
  onboardingForm = this.fb.group({
    adresseEntreprise: [''],
    secteurActivite: [''],
    description: ['', [Validators.minLength(100)]],
    logo: ['']
  });

  secteurOptions = ['Technologies', 'Finance', 'Santé', 'Éducation', 'Industrie', 'Commerce', 'Énergie', 'Ressources Humaines', 'Data & Analytics', 'Conseil', 'Autre'];

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private offresService: OffresService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.entrepriseService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.onboardingForm.patchValue({
          adresseEntreprise: profile.adresseEntreprise || '',
          secteurActivite: profile.secteurActivite || '',
          description: profile.description || '',
          logo: profile.logo || ''
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors du chargement du profil');
      }
    });

    this.statsService.getEntrepriseStats().subscribe({
      next: (s) => {
        const oldNiveau = this.stats()?.niveau;
        this.stats.set(s);
        this.loading.set(false);

        // Confetti trigger on level up
        if (oldNiveau && s.niveau !== oldNiveau) {
          this.triggerConfetti();
        }

        // Set first missing field active
        if (s.suggestions && s.suggestions.length > 0 && !this.activeOnboardingField()) {
          this.activeOnboardingField.set(s.suggestions[0].field);
        }
      },
      error: () => this.loading.set(false)
    });

    this.offresService.list({ mine: true, page: 1, pageSize: 10 }).subscribe({
      next: (result) => {
        this.offres.set(result.items);
      },
      error: () => {}
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
    const payload: Partial<EntrepriseProfile> = {};

    if (field === 'adresseEntreprise') {
      payload.adresseEntreprise = values.adresseEntreprise || '';
    } else if (field === 'secteurActivite') {
      payload.secteurActivite = values.secteurActivite || '';
    } else if (field === 'description') {
      if (this.onboardingForm.get('description')?.invalid) {
        this.onboardingLoading.set(false);
        alert('La description doit faire au moins 100 caractères pour valider cette étape.');
        return;
      }
      payload.description = values.description || '';
    } else if (field === 'logo') {
      payload.logo = values.logo || '';
    }

    this.entrepriseService.updateProfile(payload).subscribe({
      next: () => {
        this.onboardingLoading.set(false);
        this.onboardingSuccess.set('Enregistré avec succès !');
        
        setTimeout(() => {
          this.activeOnboardingField.set(null);
          this.loadData();
        }, 1200);
      },
      error: () => {
        this.onboardingLoading.set(false);
        alert('Erreur lors de la mise à jour.');
      }
    });
  }

  // Logo upload simulation
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Logo = reader.result as string;
        this.onboardingForm.patchValue({ logo: base64Logo });
        this.saveOnboardingField('logo');
      };
      reader.readAsDataURL(file);
    }
  }

  getNiveauBadgeClass(niveau: string): string {
    switch (niveau) {
      case 'Super Recruteur': return 'badge-superstar';
      case 'Expert Recruteur': return 'badge-expert';
      case 'Recruteur Certifié': return 'badge-avance';
      case 'Recruteur Actif': return 'badge-inter';
      default: return 'badge-debutant';
    }
  }

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

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
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
