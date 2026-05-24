import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { CandidaturesService } from '../../core/services/candidatures.service';
import { Candidature } from '../../shared/models/types';

@Component({
  selector: 'app-candidat-candidatures',
  imports: [SharedModule],
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.scss']
})
export class CandidaturesComponent implements OnInit {
  candidatures = signal<Candidature[]>([]);
  error = signal<string | null>(null);

  constructor(private candidaturesService: CandidaturesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.candidaturesService.listMine().subscribe({
      next: (items) => this.candidatures.set(items),
      error: () => this.error.set('Erreur lors du chargement des candidatures')
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
