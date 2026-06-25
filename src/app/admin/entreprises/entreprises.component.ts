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
  Math = Math;
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

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedEntreprises = computed(() => {
    const filtered = this.filteredEntreprises();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredEntreprises().length / this.itemsPerPage));

  // Stats
  totalEntreprises = computed(() => this.entreprises().length);
  activeEntreprises = computed(() => this.entreprises().filter(e => e.isActive !== false).length);
  inactiveEntreprises = computed(() => this.entreprises().filter(e => e.isActive === false).length);

  // Sub-table (Offers)
  expandedEntrepriseId = signal<string | null>(null);
  entrepriseOffres = signal<any[]>([]);
  offresLoading = signal(false);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listEntreprises().subscribe({
      next: (items) => {
        this.entreprises.set(items);
        this.currentPage.set(1);
      },
      error: () => this.error.set('Erreur lors du chargement des entreprises')
    });
  }

  toggleStatus(entreprise: AdminEntreprise): void {
    this.adminService.toggleUserStatus(entreprise.id).subscribe({
      next: (res) => {
        entreprise.isActive = res.isActive;
        this.entreprises.update(e => [...e]);
      },
      error: () => this.error.set('Impossible de changer le statut')
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleExpanded(entrepriseId: string): void {
    if (this.expandedEntrepriseId() === entrepriseId) {
      this.expandedEntrepriseId.set(null);
      this.entrepriseOffres.set([]);
    } else {
      this.expandedEntrepriseId.set(entrepriseId);
      this.offresLoading.set(true);
      this.entrepriseOffres.set([]);
      this.adminService.getEntrepriseOffres(entrepriseId).subscribe({
        next: (offres) => {
          this.entrepriseOffres.set(offres);
          this.offresLoading.set(false);
        },
        error: () => {
          this.error.set('Erreur chargement offres');
          this.offresLoading.set(false);
        }
      });
    }
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
