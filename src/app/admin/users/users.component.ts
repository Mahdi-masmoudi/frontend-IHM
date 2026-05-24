import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { AdminService, AdminUser } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [SharedModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  remove(id: string): void {
    if (!confirm('Voulez-vous supprimer cet utilisateur ?')) {
      return;
    }

    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Suppression impossible')
    });
  }
}
