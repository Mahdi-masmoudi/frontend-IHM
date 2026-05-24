import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { AdminEntreprise, AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-entreprises',
  imports: [SharedModule],
  templateUrl: './entreprises.component.html',
  styleUrls: ['./entreprises.component.scss']
})
export class EntreprisesComponent implements OnInit {
  entreprises = signal<AdminEntreprise[]>([]);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listEntreprises().subscribe({
      next: (items) => this.entreprises.set(items),
      error: () => this.error.set('Erreur lors du chargement des entreprises')
    });
  }

  remove(id: number): void {
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Suppression impossible')
    });
  }
}
