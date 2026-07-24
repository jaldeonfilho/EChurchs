import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Agenda</h1>
      <div>
        <button class="btn-secondary" (click)="activeTab = 'bulletins'" [class.active]="activeTab === 'bulletins'">Avisos</button>
        <button class="btn-secondary" (click)="activeTab = 'events'" [class.active]="activeTab === 'events'">Eventos</button>
      </div>
    </div>

    <div *ngIf="activeTab === 'bulletins'">
      <div class="form-card" *ngIf="showBulletinForm">
        <h3>{{ editingBulletinId ? 'Editar Aviso' : 'Novo Aviso' }}</h3>
        <form (ngSubmit)="onBulletinSubmit()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="bulletinData.title" name="title" required>
          </div>
          <div class="form-group">
            <label>Conteúdo *</label>
            <textarea [(ngModel)]="bulletinData.content" name="content" rows="4" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" class="btn-secondary" (click)="cancelBulletinEdit()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="table-container" *ngIf="!showBulletinForm">
        <table>
          <thead><tr><th>Título</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngIf="bulletins.length === 0"><td colspan="2" class="empty">Nenhum aviso</td></tr>
            <tr *ngFor="let b of bulletins">
              <td>{{ b.title }}</td>
              <td class="actions">
                <button class="btn-edit" (click)="editBulletin(b)">Editar</button>
                <button class="btn-delete" (click)="deleteBulletin(b.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="activeTab === 'events'">
      <div class="form-card" *ngIf="showEventForm">
        <h3>Novo Evento</h3>
        <form (ngSubmit)="onEventSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Título *</label>
              <input type="text" [(ngModel)]="eventData.title" name="title" required>
            </div>
            <div class="form-group">
              <label>Local</label>
              <input type="text" [(ngModel)]="eventData.location" name="location">
            </div>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="eventData.description" name="description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data Início *</label>
              <input type="datetime-local" [(ngModel)]="eventData.startDate" name="startDate" required>
            </div>
            <div class="form-group">
              <label>Data Fim *</label>
              <input type="datetime-local" [(ngModel)]="eventData.endDate" name="endDate" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Criar Evento</button>
            <button type="button" class="btn-secondary" (click)="showEventForm = false">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="table-container" *ngIf="!showEventForm">
        <table>
          <thead><tr><th>Título</th><th>Data</th><th>Local</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngIf="events.length === 0"><td colspan="4" class="empty">Nenhum evento</td></tr>
            <tr *ngFor="let e of events">
              <td>{{ e.title }}</td>
              <td>{{ e.startDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ e.location || '-' }}</td>
              <td class="actions">
                <button class="btn-delete" (click)="deleteEvent(e.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .btn-primary { padding: 0.5rem 1rem; background: #1a1a2e; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.25rem; }
    .btn-secondary.active { background: #1a1a2e; }
    .form-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
    .form-card h3 { margin: 0 0 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-family: inherit; }
    .form-actions { margin-top: 1rem; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; color: #555; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-edit { padding: 0.25rem 0.75rem; background: #4fc3f7; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-delete { padding: 0.25rem 0.75rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .badge-published { background: #d4edda; color: #155724; }
    .badge-draft { background: #fff3cd; color: #856404; }
  `]
})
export class AgendaComponent implements OnInit {
  activeTab = 'bulletins';
  bulletins: GenericModuleItem[] = [];
  events: GenericModuleItem[] = [];
  showBulletinForm = false;
  showEventForm = false;
  editingBulletinId: string | null = null;
  bulletinData: GenericModuleRequest = { title: '', content: '' };
  eventData: GenericModuleRequest = { title: '', description: '', startDate: '', endDate: '', location: '' };
  private communityId = '';

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    this.communityId = this.authService.currentCommunityId ?? '';
    if (this.communityId) {
      this.loadBulletins();
      this.loadEvents();
    }
  }

  loadBulletins(): void {
    this.moduleService.getAll('bulletins').subscribe(r => { if (r.success && r.data) this.bulletins = r.data; });
  }

  loadEvents(): void {
    this.moduleService.getAll('events').subscribe(r => { if (r.success && r.data) this.events = r.data; });
  }

  onBulletinSubmit(): void {
    if (this.editingBulletinId) {
      this.moduleService.update('bulletins', this.editingBulletinId, this.bulletinData).subscribe(() => { this.loadBulletins(); this.cancelBulletinEdit(); });
    } else {
      this.moduleService.create('bulletins', this.bulletinData).subscribe(() => { this.loadBulletins(); this.cancelBulletinEdit(); });
    }
  }

  editBulletin(b: GenericModuleItem): void {
    this.editingBulletinId = b.id;
    this.bulletinData = { title: b.title, content: b.content };
    this.showBulletinForm = true;
  }

  deleteBulletin(id: string): void {
    if (confirm('Excluir aviso?')) {
      this.moduleService.delete('bulletins', id).subscribe(() => this.loadBulletins());
    }
  }

  cancelBulletinEdit(): void {
    this.showBulletinForm = false;
    this.editingBulletinId = null;
    this.bulletinData = { title: '', content: '' };
  }

  onEventSubmit(): void {
    this.moduleService.create('events', this.eventData).subscribe(() => { this.loadEvents(); this.showEventForm = false; this.eventData = { title: '', description: '', startDate: '', endDate: '', location: '' }; });
  }

  deleteEvent(id: string): void {
    if (confirm('Excluir evento?')) {
      this.moduleService.delete('events', id).subscribe(() => this.loadEvents());
    }
  }
}
