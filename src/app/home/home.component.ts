import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../theme/shared/shared.module';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  searchForm = this.fb.group({
    q: [''],
    localisation: ['']
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  onSearch(): void {
    const { q, localisation } = this.searchForm.value;
    this.router.navigate(['/offres'], { queryParams: { q, localisation } });
  }
}
