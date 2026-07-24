import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="announcements-page">
      <div class="page-header card">
        <h2>Avisos</h2>
        <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Novo Aviso' }}</button>
      </div>

      <div class="form-card card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar Aviso' : 'Novo Aviso' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="formData.title" name="title" required>
          </div>
          <div class="form-group">
            <label>Conteúdo *</label>
            <textarea [(ngModel)]="formData.content" name="content" rows="5" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editingId ? 'Salvar' : 'Publicar' }}</button>
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="bulletin-list" *ngIf="!showForm">
        <div class="bulletin-card card" *ngFor="let b of bulletins">
          <div class="bulletin-header">
            <div class="avatar-sm">📢</div>
            <div class="bulletin-meta">
              <strong>{{ b.title }}</strong>
              <span>{{ b.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="bulletin-actions">
              <button class="btn-icon" (click)="edit(b)">✏️</button>
              <button class="btn-icon btn-danger" (click)="deleteBulletin(b.id)">🗑️</button>
            </div>
          </div>
          <p class="bulletin-content">{{ b.content || b.description }}</p>
        </div>
        <div class="empty-state card" *ngIf="bulletins.length === 0">
          <span class="empty-icon">📢</span>
          <p>Nenhum aviso publicado</p>
          <button class="btn-primary-sm" (click)="showForm = true">Criar primeiro aviso</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .announcements-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }
    .btn-primary-sm { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px;
      font-size: 0.9rem; box-sizing: border-box; outline: none; font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .bulletin-card { padding: 1rem 1.25rem; }
    .bulletin-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }
    .bulletin-meta { flex: 1; }
    .bulletin-meta strong { display: block; font-size: 0.95rem; }
    .bulletin-meta span { font-size: 0.8rem; color: #65676b; }
    .bulletin-actions { display: flex; gap: 0.25rem; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .bulletin-content { font-size: 0.9rem; color: #1c1e21; margin: 0; line-height: 1.6; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class AnnouncementsComponent implements OnInit {
  bulletins: GenericModuleItem[] = [];
  showForm = false;
  editingId: string | null = null;
  formData: GenericModuleRequest = { title: '', content: '' };

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadBulletins();
  }

  loadBulletins(): void {
    this.moduleService.getAll('bulletins').subscribe(r => { if (r.success && r.data) this.bulletins = r.data; });
  }

  onSubmit(): void {
    if (this.editingId) {
      this.moduleService.update('bulletins', this.editingId, this.formData).subscribe(() => { this.loadBulletins(); this.cancel(); });
    } else {
      this.moduleService.create('bulletins', this.formData).subscribe(() => { this.loadBulletins(); this.cancel(); });
    }
  }

  edit(b: GenericModuleItem): void {
    this.editingId = b.id;
    this.formData = { title: b.title, content: b.content };
    this.showForm = true;
  }

  deleteBulletin(id: string): void {
    if (confirm('Excluir aviso?')) this.moduleService.delete('bulletins', id).subscribe(() => this.loadBulletins());
  }

  cancel(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { title: '', content: '' };
  }
}
