import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { AdminService } from '../../core/services/admin.service';
import { Offre } from '../../shared/models/types';

@Component({
  selector: 'app-admin-offres',
  imports: [SharedModule],
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.scss']
})
export class OffresComponent implements OnInit {
  offres = signal<Offre[]>([]);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listOffres().subscribe({
      next: (offres) => {
        this.offres.set(offres);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
      }
    });
  }

  remove(id: number): void {
    this.adminService.deleteOffre(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Suppression impossible')
    });
  }
}
