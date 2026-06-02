import { Component, OnInit, signal, computed } from '@angular/core';
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
  searchTerm = signal<string>('');

  filteredCandidats = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allCandidats = this.candidats();
    if (!term) return allCandidats;
    return allCandidats.filter(c => 
      (c.nom || '').toLowerCase().includes(term) ||
      (c.prenom || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.telephone || '').toLowerCase().includes(term) ||
      (c.niveauEtude || '').toLowerCase().includes(term) ||
      (c.adresse || '').toLowerCase().includes(term) ||
      String(c.experience ?? '').toLowerCase().includes(term)
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
    this.adminService.listCandidats().subscribe({
      next: (items) => this.candidats.set(items),
      error: () => this.error.set('Erreur lors du chargement des candidats')
    });
  }

  confirmRemove(id: string, name: string): void {
    this.idToDelete.set(id);
    this.confirmMessage.set(`Voulez-vous vraiment supprimer le candidat "${name}" ?`);
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
