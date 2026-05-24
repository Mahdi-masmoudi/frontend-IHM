import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { PublicComponent } from './theme/layout/public/public.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // ── Public Site & Candidat (TheJobs Style) ──
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
        pathMatch: 'full'
      },
      {
        path: 'offres',
        loadComponent: () => import('./offres/offres-list/offres-list.component').then((c) => c.OffresListComponent)
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./offres/offre-detail/offre-detail.component').then((c) => c.OffreDetailComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then((c) => c.RegisterComponent)
      },
      // Candidat Routes (Inside Public Layout, but protected)
      {
        path: 'candidat/dashboard',
        loadComponent: () => import('./candidat/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['CANDIDAT'] }
      },
      {
        path: 'candidat/candidatures',
        loadComponent: () => import('./candidat/candidatures/candidatures.component').then((c) => c.CandidaturesComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['CANDIDAT'] }
      },
      {
        path: 'candidat/profile',
        loadComponent: () => import('./candidat/profile/profile.component').then((c) => c.ProfileComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['CANDIDAT'] }
      }
    ]
  },
  
  // ── Backoffice (Entreprise & Admin) ──
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      // Entreprise Routes
      {
        path: 'entreprise/dashboard',
        loadComponent: () => import('./entreprise/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'entreprise/candidatures',
        loadComponent: () => import('./entreprise/candidatures/candidatures.component').then((c) => c.CandidaturesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'entreprise/offres',
        loadComponent: () => import('./entreprise/offres/offres.component').then((c) => c.OffresComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'offres/nouveau',
        loadComponent: () => import('./offres/offre-form/offre-form.component').then((c) => c.OffreFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'offres/:id/edit',
        loadComponent: () => import('./offres/offre-form/offre-form.component').then((c) => c.OffreFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'candidatures/offre/:id',
        loadComponent: () => import('./candidatures/candidatures-offre/candidatures-offre.component').then((c) => c.CandidaturesOffreComponent),
        canActivate: [roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },

      // Admin Routes
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./admin/users/users.component').then((c) => c.UsersComponent),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/candidats',
        loadComponent: () => import('./admin/candidats/candidats.component').then((c) => c.CandidatsComponent),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/entreprises',
        loadComponent: () => import('./admin/entreprises/entreprises.component').then((c) => c.EntreprisesComponent),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/offres',
        loadComponent: () => import('./admin/offres/offres.component').then((c) => c.OffresComponent),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      }
    ]
  },
  
  // Fallback
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
