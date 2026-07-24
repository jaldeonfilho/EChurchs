import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-left">
        <div class="auth-brand">
          <span class="logo">⛪</span>
          <h1>Echurchs</h1>
          <p>Ligue a sua igreja.<br>Fortaleça a comunidade.</p>
          <div class="features">
            <div class="feature">👥 Gestão de membros</div>
            <div class="feature">📅 Eventos e agendas</div>
            <div class="feature">💰 Controle financeiro</div>
            <div class="feature">📡 Cultos ao vivo</div>
            <div class="feature">💬 Mensagens e comunicação</div>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1877f2 0%, #0d47a1 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }
    .auth-brand {
      max-width: 480px;
    }
    .auth-brand .logo { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .auth-brand h1 { font-size: 2.8rem; font-weight: 700; margin-bottom: 0.75rem; }
    .auth-brand p { font-size: 1.25rem; opacity: 0.9; line-height: 1.6; margin-bottom: 2rem; }
    .features { display: flex; flex-direction: column; gap: 0.75rem; }
    .feature {
      font-size: 1rem;
      opacity: 0.85;
      padding: 0.5rem 0;
    }
    .auth-right {
      width: 480px;
      min-width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f0f2f5;
    }
    @media (max-width: 900px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; min-width: auto; }
    }
  `]
})
export class AuthLayoutComponent {}
