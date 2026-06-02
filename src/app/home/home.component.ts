import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../theme/shared/shared.module';
import { OffresService } from '../core/services/offres.service';
import { Offre } from '../shared/models/types';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private offresService = inject(OffresService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  searchForm!: FormGroup;
  latestOffres = signal<Offre[]>([]);
  loading = signal<boolean>(true);

  selectedCategory = signal<string>('Technology');

  categories = [
    { name: 'Developer', icon: 'ti-code', count: '1200 jobs' },
    { name: 'Technology', icon: 'ti-device-laptop', count: '850 jobs' },
    { name: 'Accounting', icon: 'ti-calculator', count: '300 jobs' },
    { name: 'Medical', icon: 'ti-heart-pulse', count: '450 jobs' },
    { name: 'Government', icon: 'ti-building', count: '150 jobs' },
    { name: 'All Jobs', icon: 'ti-briefcase', count: '3000+ jobs' }
  ];

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      q: [''],
      localisation: [''],
      contractType: ['']
    });

    this.loadLatestOffres();
  }

  loadLatestOffres(): void {
    this.loading.set(true);
    this.offresService.list({ page: 1, pageSize: 6, sortBy: 'datePublication' }).subscribe({
      next: (res) => {
        this.latestOffres.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const filters = this.searchForm.value;
    this.router.navigate(['/offres'], {
      queryParams: {
        q: filters.q || null,
        localisation: filters.localisation || null,
        typeContrat: filters.contractType || null
      }
    });
  }

  selectCategory(categoryName: string): void {
    this.selectedCategory.set(categoryName);
    
    // In a real app we might filter. For now, let's navigate to /offres with category
    if (categoryName === 'All Jobs') {
      this.router.navigate(['/offres']);
    } else {
      this.router.navigate(['/offres'], { queryParams: { q: categoryName } });
    }
  }

  getDaysAgo(dateString: string): string {
    const pubDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "1 jour";
    return `${diffDays} jours`;
  }
}
