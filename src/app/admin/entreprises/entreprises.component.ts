import { Component, OnInit, signal, computed } from '@angular/core';
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
  searchTerm = signal<string>('');

  filteredEntreprises = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allEntreprises = this.entreprises();
    if (!term) return allEntreprises;
    return allEntreprises.filter(e => 
      (e.nomEntreprise || '').toLowerCase().includes(term) ||
      (e.adresseEntreprise || '').toLowerCase().includes(term) ||
      (e.nom || '').toLowerCase().includes(term) ||
      (e.prenom || '').toLowerCase().includes(term) ||
      (e.email || '').toLowerCase().includes(term) ||
      (e.secteurActivite || '').toLowerCase().includes(term)
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
    this.adminService.listEntreprises().subscribe({
      next: (items) => this.entreprises.set(items),
      error: () => this.error.set('Erreur lors du chargement des entreprises')
    });
  }

  confirmRemove(id: string, name: string): void {
    this.idToDelete.set(id);
    this.confirmMessage.set(`Voulez-vous vraiment supprimer l'entreprise "${name}" ?`);
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
