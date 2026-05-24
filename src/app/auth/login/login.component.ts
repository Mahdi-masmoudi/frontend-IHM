import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../theme/shared/shared.module';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../shared/models/types';

@Component({
  selector: 'app-auth-login',
  imports: [SharedModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);
  rememberMe = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = this.form.getRawValue();

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.navigateByRole(response.user.role as Role);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Identifiants incorrects');
      }
    });
  }

  private navigateByRole(role: Role): void {
    if (role === 'CANDIDAT') {
      this.router.navigate(['/candidat/dashboard']);
      return;
    }
    if (role === 'ENTREPRISE') {
      this.router.navigate(['/entreprise/dashboard']);
      return;
    }
    this.router.navigate(['/admin/dashboard']);
  }
}
