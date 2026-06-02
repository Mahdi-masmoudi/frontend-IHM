import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { OffresService } from '../../core/services/offres.service';
import { Offre } from '../../shared/models/types';

@Component({
  selector: 'app-entreprise-offres',
  imports: [SharedModule, RouterModule],
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.scss']
})
export class OffresComponent implements OnInit {
  offres = signal<Offre[]>([]);
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(private offresService: OffresService) {}

  get totalCount(): number {
    return this.offres().length;
  }
  get activeCount(): number {
    return this.offres().filter(o => o.statut === 'ACTIVE').length;
  }
  get totalCandidaturesCount(): number {
    return this.offres().reduce((acc, curr) => acc + (curr.candidaturesCount || 0), 0);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.offresService.list({ mine: true, page: 1, pageSize: 50 }).subscribe({
      next: (result) => {
        this.offres.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
        this.loading.set(false);
      }
    });
  }

  remove(id: string): void {
    if (!confirm('Supprimer cette offre ?')) return;

    this.offresService.remove(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.error?.message || 'Impossible de supprimer')
    });
  }
}
