import { Component, OnInit, signal, computed } from '@angular/core';
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
  searchTerm = signal<string>('');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allUsers = this.users();
    if (!term) return allUsers;
    return allUsers.filter(u => 
      (u.nom || '').toLowerCase().includes(term) ||
      (u.prenom || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    );
  });
  showConfirmModal = signal(false);
  idToDelete = signal<string | null>(null);
  confirmMessage = signal<string>('');

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

  confirmRemove(id: string, name: string): void {
    this.idToDelete.set(id);
    this.confirmMessage.set(`Voulez-vous vraiment supprimer l'utilisateur "${name}" ?`);
    this.showConfirmModal.set(true);
  }

  cancelDelete(): void {
    this.showConfirmModal.set(false);
    this.idToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.idToDelete();
    if (!id) return;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.showConfirmModal.set(false);
        this.idToDelete.set(null);
        this.load();
      },
      error: () => {
        this.showConfirmModal.set(false);
        this.idToDelete.set(null);
        this.error.set('Suppression impossible');
      }
    });
  }
}
