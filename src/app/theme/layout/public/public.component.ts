import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { AuthProfile } from '../../../shared/models/types';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  isLoggedIn = signal(false);
  currentUser = signal<AuthProfile | null>(null);

  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn.set(this.tokenService.hasValidToken());
    if (this.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (profile) => this.currentUser.set(profile),
        error: () => this.logout()
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  get isAuthPage(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/register');
  }
}
