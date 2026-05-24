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

  constructor(private offresService: OffresService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.offresService.list({ mine: true, page: 1, pageSize: 20 }).subscribe({
      next: (result) => {
        this.offres.set(result.items);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
      }
    });
  }

  remove(id: number): void {
    this.offresService.remove(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.error.set('Suppression impossible');
      }
    });
  }
}
