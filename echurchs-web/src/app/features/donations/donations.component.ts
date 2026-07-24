import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="donations-page">
      <div class="page-header card">
        <h2>Doações</h2>
        <button class="btn-primary" (click)="showLinkForm = !showLinkForm">{{ showLinkForm ? 'Cancelar' : '+ Novo Link' }}</button>
      </div>

      <div class="tabs card">
        <button [class.active]="activeTab === 'donations'" (click)="activeTab = 'donations'">💝 Doações</button>
        <button [class.active]="activeTab === 'links'" (click)="activeTab = 'links'">🔗 Links de Pagamento</button>
      </div>

      <div class="form-card card" *ngIf="showLinkForm">
        <h3>Novo Link de Pagamento</h3>
        <div class="form-group"><label>Título *</label><input type="text" [(ngModel)]="linkForm.title" name="title"></div>
        <div class="form-group"><label>URL Externa *</label><input type="text" [(ngModel)]="linkForm.location" name="location" placeholder="https://..."></div>
        <div class="form-actions">
          <button class="btn-primary" (click)="createLink()">Criar Link</button>
        </div>
      </div>

      <div *ngIf="activeTab === 'donations' && !showLinkForm" class="donation-list">
        <div class="donation-item card" *ngFor="let d of donations">
          <div class="donation-avatar">💝</div>
          <div class="donation-info">
            <strong>{{ d.name }}</strong>
            <span>{{ d.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <span class="donation-amount">{{ d.amount | number:'1.2-2' }} EUR</span>
        </div>
        <div class="empty-state card" *ngIf="donations.length === 0"><span class="empty-icon">💝</span><p>Nenhuma doação registrada</p></div>
      </div>

      <div *ngIf="activeTab === 'links' && !showLinkForm" class="link-list">
        <div class="link-card card" *ngFor="let l of paymentLinks">
          <div class="link-icon">🔗</div>
          <div class="link-info">
            <strong>{{ l.name }}</strong>
            <span class="link-url">{{ l.location }}</span>
          </div>
          <button class="btn-icon btn-danger" (click)="deleteLink(l.id)">🗑️</button>
        </div>
        <div class="empty-state card" *ngIf="paymentLinks.length === 0"><span class="empty-icon">🔗</span><p>Nenhum link de pagamento</p></div>
      </div>
    </div>
  `,
  styles: [`
    .donations-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .tabs { display: flex; padding: 0; overflow: hidden; }
    .tabs button { flex: 1; padding: 0.65rem; background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #65676b; font-weight: 500; transition: all 0.2s; }
    .tabs button.active { background: #e7f3ff; color: #1877f2; font-weight: 600; }
    .tabs button:hover { background: #f0f2f5; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none; }
    .form-group input:focus { border-color: #1877f2; }
    .form-actions { margin-top: 0.5rem; }
    .donation-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .donation-avatar { width: 40px; height: 40px; border-radius: 50%; background: #fce4e4; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .donation-info { flex: 1; }
    .donation-info strong { font-size: 0.95rem; display: block; }
    .donation-info span { font-size: 0.8rem; color: #65676b; }
    .donation-amount { font-weight: 700; color: #27ae60; font-size: 0.95rem; }
    .link-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .link-icon { font-size: 1.5rem; width: 40px; text-align: center; }
    .link-info { flex: 1; }
    .link-info strong { font-size: 0.95rem; display: block; }
    .link-url { font-size: 0.8rem; color: #1877f2; word-break: break-all; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class DonationsComponent implements OnInit {
  activeTab = 'donations';
  donations: GenericModuleItem[] = [];
  paymentLinks: GenericModuleItem[] = [];
  showLinkForm = false;
  linkForm: GenericModuleRequest = { title: '', location: '' };

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadData();
  }

  loadData(): void {
    this.moduleService.getAll('donations').subscribe(r => { if (r.success && r.data) this.donations = r.data; });
    this.moduleService.getAll('payment-links').subscribe(r => { if (r.success && r.data) this.paymentLinks = r.data; });
  }

  createLink(): void {
    this.moduleService.create('payment-links', this.linkForm).subscribe(() => {
      this.loadData(); this.showLinkForm = false; this.linkForm = { title: '', location: '' };
    });
  }

  deleteLink(id: string): void {
    if (confirm('Excluir link?')) this.moduleService.delete('payment-links', id).subscribe(() => this.loadData());
  }
}
