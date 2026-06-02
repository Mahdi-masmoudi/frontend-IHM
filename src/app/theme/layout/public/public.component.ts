import { Component, signal, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
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
  profileMenuOpen = signal(false);
  private currentToken: string | null = null;

  constructor(private authService: AuthService, private tokenService: TokenService, private router: Router) {}

  ngOnInit() {
    this.refreshAuth();

    // Subscribe to router events to refresh auth state when navigating
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshAuth();
    });
  }

  refreshAuth(): void {
    const activeToken = this.tokenService.getToken();
    const logged = this.tokenService.hasValidToken();
    this.isLoggedIn.set(logged);

    if (logged) {
      if (!this.currentUser() || this.currentToken !== activeToken) {
        this.currentToken = activeToken;
        this.authService.getProfile().subscribe({
          next: (profile) => this.currentUser.set(profile),
          error: () => this.logout()
        });
      }
    } else {
      this.currentToken = null;
      this.currentUser.set(null);
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.currentToken = null;
    this.router.navigate(['/login']);
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen.update(v => !v);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeProfileMenu();
  }

  get isAuthPage(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/register');
  }
}
