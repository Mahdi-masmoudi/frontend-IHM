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
  Math = Math;
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

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  paginatedCandidats = computed(() => {
    const filtered = this.filteredCandidats();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredCandidats().length / this.itemsPerPage));

  // Stats
  totalCandidats = computed(() => this.candidats().length);
  activeCandidats = computed(() => this.candidats().filter(c => c.isActive !== false).length);
  inactiveCandidats = computed(() => this.candidats().filter(c => c.isActive === false).length);

  // Sub-table (Applications)
  expandedCandidatId = signal<string | null>(null);
  candidatApplications = signal<any[]>([]);
  applicationsLoading = signal(false);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.listCandidats().subscribe({
      next: (items) => {
        this.candidats.set(items);
        this.currentPage.set(1);
      },
      error: () => this.error.set('Erreur lors du chargement des candidats')
    });
  }

  toggleStatus(candidat: AdminCandidat): void {
    this.adminService.toggleUserStatus(candidat.id).subscribe({
      next: (res) => {
        candidat.isActive = res.isActive;
        this.candidats.update(c => [...c]);
      },
      error: () => this.error.set('Impossible de changer le statut')
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleExpanded(candidatId: string): void {
    if (this.expandedCandidatId() === candidatId) {
      this.expandedCandidatId.set(null);
      this.candidatApplications.set([]);
    } else {
      this.expandedCandidatId.set(candidatId);
      this.applicationsLoading.set(true);
      this.candidatApplications.set([]);
      this.adminService.getCandidatApplications(candidatId).subscribe({
        next: (apps) => {
          this.candidatApplications.set(apps);
          this.applicationsLoading.set(false);
        },
        error: () => {
          this.error.set('Erreur chargement candidatures');
          this.applicationsLoading.set(false);
        }
      });
    }
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
