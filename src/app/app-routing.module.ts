import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/offres',
        pathMatch: 'full'
      },
      {
        path: 'offres',
        loadComponent: () => import('./offres/offres-list/offres-list.component').then((c) => c.OffresListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'offres/nouveau',
        loadComponent: () => import('./offres/offre-form/offre-form.component').then((c) => c.OffreFormComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'offres/:id/edit',
        loadComponent: () => import('./offres/offre-form/offre-form.component').then((c) => c.OffreFormComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./offres/offre-detail/offre-detail.component').then((c) => c.OffreDetailComponent),
        canActivate: [authGuard]
      },
      {
        path: 'candidatures/offre/:id',
        loadComponent: () =>
          import('./candidatures/candidatures-offre/candidatures-offre.component').then((c) => c.CandidaturesOffreComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
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
      },
      {
        path: 'entreprise/dashboard',
        loadComponent: () => import('./entreprise/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'entreprise/candidatures',
        loadComponent: () => import('./entreprise/candidatures/candidatures.component').then((c) => c.CandidaturesComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'entreprise/offres',
        loadComponent: () => import('./entreprise/offres/offres.component').then((c) => c.OffresComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENTREPRISE'] }
      },
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./admin/users/users.component').then((c) => c.UsersComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/candidats',
        loadComponent: () => import('./admin/candidats/candidats.component').then((c) => c.CandidatsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/entreprises',
        loadComponent: () => import('./admin/entreprises/entreprises.component').then((c) => c.EntreprisesComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'admin/offres',
        loadComponent: () => import('./admin/offres/offres.component').then((c) => c.OffresComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'demo',
        redirectTo: '/offres',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then((c) => c.RegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
