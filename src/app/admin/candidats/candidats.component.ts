import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { AdminCandidat, AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-candidats',
  imports: [SharedModule],
  templateUrl: './candidats.component.html',
  styleUrls: ['./candidats.component.scss']
})
export class CandidatsComponent implements OnInit {
  candidats = signal<AdminCandidat[]>([]);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listCandidats().subscribe({
      next: (items) => this.candidats.set(items),
      error: () => this.error.set('Erreur lors du chargement des candidats')
    });
  }

  remove(id: number): void {
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Suppression impossible')
    });
  }
}
