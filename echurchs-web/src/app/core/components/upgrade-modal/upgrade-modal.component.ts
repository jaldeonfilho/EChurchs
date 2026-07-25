import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { UpgradePromptService } from '../../services/upgrade-prompt.service';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="modal-overlay" *ngIf="upgradePrompt.message$ | async as message" (click)="close()">
      <div class="modal card" (click)="$event.stopPropagation()">
        <div class="modal-icon">🚀</div>
        <h3>Limite do plano atingido</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn-secondary" (click)="close()">Fechar</button>
          <button class="btn-primary" (click)="goToBilling()">Ver Planos</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
    .modal { width: 100%; max-width: 380px; border-radius: 12px; padding: 1.75rem; text-align: center; background: white; }
    .modal-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .modal h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #1c1e21; }
    .modal p { margin: 0 0 1.25rem; font-size: 0.9rem; color: #65676b; line-height: 1.4; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
    .btn-secondary { padding: 0.55rem 1.25rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 8px; font-size: 0.9rem; cursor: pointer; }
    .btn-secondary:hover { background: #d8dadf; }
    .btn-primary { padding: 0.55rem 1.25rem; background: #1877f2; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
    .btn-primary:hover { background: #166fe5; }
  `]
})
export class UpgradeModalComponent {
  constructor(public upgradePrompt: UpgradePromptService, private router: Router) {}

  close(): void {
    this.upgradePrompt.clear();
  }

  goToBilling(): void {
    this.upgradePrompt.clear();
    this.router.navigate(['/billing']);
  }
}
