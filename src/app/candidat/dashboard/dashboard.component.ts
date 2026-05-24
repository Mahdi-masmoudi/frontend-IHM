import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { StatsService, CandidatStats } from '../../core/services/stats.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthProfile } from '../../shared/models/types';

@Component({
  selector: 'app-candidat-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<CandidatStats | null>(null);
  profile = signal<AuthProfile | null>(null);
  loading = signal(true);

  constructor(private statsService: StatsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.authService.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: () => {}
    });

    this.statsService.getCandidatStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

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
}
