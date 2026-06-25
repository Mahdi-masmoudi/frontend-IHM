import { CommonModule } from '@angular/common';
import { Component, signal, HostListener } from '@angular/core';
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
  userProfile = this.authService.currentUser;

  get isNoPaddingPage(): boolean {
    const url = this.router.url;
    return url.includes('/offres/nouveau') || url.includes('/edit') || url.includes('/entreprise/candidatures') || url.includes('/entreprise/offres');
  }

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.userProfile()) {
      this.loadProfile();
    }
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
    this.authService.loadProfile();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleProfileMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.profileMenuOpen.update(v => !v);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeProfileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
