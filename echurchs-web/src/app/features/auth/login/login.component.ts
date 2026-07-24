import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <h2>Entrar</h2>
      <p class="subtitle">Acesse sua conta Echurchs</p>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" placeholder="seu@email.com" required>
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" [(ngModel)]="password" name="password" placeholder="Sua senha" required>
        </div>
        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <button type="submit" [disabled]="loading" class="btn-primary">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <div class="divider"><span>ou</span></div>
      <p class="link">Não tem conta? <a routerLink="/auth/register">Criar conta</a></p>
    </div>
  `,
  styles: [`
    .login-container { width: 100%; }
    h2 { font-size: 1.5rem; margin: 0 0 0.25rem; color: #1c1e21; }
    .subtitle { color: #65676b; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.35rem; font-weight: 500; font-size: 0.9rem; color: #1c1e21; }
    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #dddfe2;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus { border-color: #1877f2; }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #1877f2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #e74c3c; margin-bottom: 1rem; font-size: 0.875rem; }
    .divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
      color: #bec3c9;
      font-size: 0.85rem;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #dadde1;
    }
    .divider span { padding: 0 0.75rem; }
    .link { text-align: center; margin-top: 1rem; font-size: 0.9rem; }
    .link a { color: #1877f2; font-weight: 600; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/feed']);
        } else {
          this.errorMessage = response.message || 'Erro ao fazer login';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Erro ao conectar com o servidor';
      }
    });
  }
}
