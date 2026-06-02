import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role, AuthProfile } from '../../../shared/models/types';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  role: Role | null = this.tokenService.getRole();
  sidebarOpen = signal(true);
  profileMenuOpen = signal(false);
  mobileMenuOpen = signal(false);
  userProfile = signal<AuthProfile | null>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadProfile();
  }

  get isAdmin(): boolean {
    return this.role === 'SUPER_ADMIN';
  }

  get isCandidat(): boolean {
    return this.role === 'CANDIDAT';
  }

  get isEntreprise(): boolean {
    return this.role === 'ENTREPRISE';
  }

  get userInitials(): string {
    const p = this.userProfile();
    if (!p) return '?';
    return `${(p.nom || '')[0] || ''}${(p.prenom || '')[0] || ''}`.toUpperCase();
  }

  get userName(): string {
    const p = this.userProfile();
    if (!p) return '';
    return `${p.prenom} ${p.nom}`;
  }

  get roleLabel(): string {
    switch (this.role) {
      case 'SUPER_ADMIN': return 'Administrateur';
      case 'CANDIDAT': return 'Candidat';
      case 'ENTREPRISE': return 'Entreprise';
      default: return '';
    }
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => this.userProfile.set(profile),
      error: () => {
        // Don't logout here — it causes an infinite loop.
        // The auth guard already protects routes.
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(v => !v);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }
}
