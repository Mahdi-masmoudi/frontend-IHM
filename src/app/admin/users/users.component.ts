import { Component, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../theme/shared/shared.module';
import { AdminService } from '../../core/services/admin.service';

interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
}

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

  remove(id: number): void {
    this.adminService.deleteUser(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Suppression impossible')
    });
  }
}
