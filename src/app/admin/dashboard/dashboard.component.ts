import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { StatsService, GlobalStats } from '../../core/services/stats.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<GlobalStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  currentTime = new Date();

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.statsService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les statistiques.');
        this.loading.set(false);
      }
    });
  }

  get taux(): number {
    const s = this.stats();
    if (!s || s.totalCandidatures === 0) return 0;
    return Math.round((s.candidaturesAcceptees / s.totalCandidatures) * 100);
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getContractColor(type: string): string {
    switch (type) {
      case 'CDI': return '#10b981';
      case 'CDD': return '#3b82f6';
      case 'STAGE': return '#f59e0b';
      case 'ALTERNANCE': return '#8b5cf6';
      case 'FREELANCE': return '#ec4899';
      default: return '#64748b';
    }
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return '#f59e0b';
      case 'ACCEPTEE': return '#10b981';
      case 'REJETEE': return '#ef4444';
      default: return '#64748b';
    }
  }

  getMaxMonthCount(): number {
    const s = this.stats();
    if (!s || !s.candidaturesByMonth.length) return 1;
    return Math.max(...s.candidaturesByMonth.map(m => m.count), 1);
  }
}
