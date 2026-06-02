import { Component, OnInit, signal, computed } from '@angular/core';
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
  searchTerm = signal<string>('');

  filteredOffres = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allOffres = this.offres();
    if (!term) return allOffres;
    return allOffres.filter(o => 
      (o.titre || '').toLowerCase().includes(term) ||
      (o.localisation || '').toLowerCase().includes(term) ||
      (o.statut || '').toLowerCase().includes(term)
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
    this.adminService.listOffres().subscribe({
      next: (offres) => {
        this.offres.set(offres);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des offres');
      }
    });
  }

  confirmRemove(id: string, name: string): void {
    this.idToDelete.set(id);
    this.confirmMessage.set(`Voulez-vous vraiment supprimer l'offre "${name}" ?`);
    this.showConfirmModal.set(true);
  }

  cancelDelete(): void {
    this.showConfirmModal.set(false);
    this.idToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.idToDelete();
    if (!id) return;

    this.adminService.deleteOffre(id).subscribe({
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
