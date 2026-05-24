import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { Candidature } from '../../shared/models/types';

@Component({
  selector: 'app-candidatures-offre',
  imports: [SharedModule],
  templateUrl: './candidatures-offre.component.html',
  styleUrls: ['./candidatures-offre.component.scss']
})
export class CandidaturesOffreComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  error = signal<string | null>(null);
  offreId = 0;

  constructor(private route: ActivatedRoute, private candidaturesService: CandidaturesService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.offreId = idParam ? Number.parseInt(idParam, 10) : 0;
    this.load();
  }

  load(): void {
    if (!this.offreId) {
      return;
    }
    this.candidaturesService.listByOffre(this.offreId).subscribe({
      next: (result) => {
        this.candidatures.set(result);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des candidatures');
      }
    });
  }

  accept(id: number): void {
    this.candidaturesService.accept(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Action impossible')
    });
  }

  reject(id: number): void {
    this.candidaturesService.reject(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Action impossible')
    });
  }

  statusClass(statut: string): string {
    if (statut === 'ACCEPTEE') {
      return 'badge bg-success';
    }
    if (statut === 'REJETEE') {
      return 'badge bg-danger';
    }
    return 'badge bg-warning text-dark';
  }
}
