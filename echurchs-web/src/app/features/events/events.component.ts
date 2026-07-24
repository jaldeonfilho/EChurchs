import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="events-page">
      <div class="page-header card">
        <h2>Eventos</h2>
        <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Novo Evento' }}</button>
      </div>

      <div class="form-card card" *ngIf="showForm">
        <h3>Novo Evento</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="formData.title" name="title" required>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data Início *</label>
              <input type="datetime-local" [(ngModel)]="formData.startDate" name="startDate" required>
            </div>
            <div class="form-group">
              <label>Data Fim</label>
              <input type="datetime-local" [(ngModel)]="formData.endDate" name="endDate">
            </div>
          </div>
          <div class="form-group">
            <label>Local</label>
            <input type="text" [(ngModel)]="formData.location" name="location">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editingId ? 'Salvar' : 'Criar Evento' }}</button>
            <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="events-list" *ngIf="!showForm">
        <div class="event-item card" *ngFor="let e of events">
          <div class="event-date-badge">
            <span class="event-day">{{ getDay(e.startDate) }}</span>
            <span class="event-month">{{ getMonth(e.startDate) }}</span>
          </div>
          <div class="event-details">
            <strong>{{ e.title }}</strong>
            <span class="event-time">{{ e.startDate | date:'HH:mm' }}{{ e.endDate ? ' - ' + (e.endDate | date:'HH:mm') : '' }}</span>
            <span class="event-location" *ngIf="e.location">📍 {{ e.location }}</span>
            <span class="event-desc" *ngIf="e.description">{{ e.description }}</span>
          </div>
          <div class="event-actions">
            <button class="btn-icon" (click)="edit(e)">✏️</button>
            <button class="btn-icon btn-danger" (click)="deleteEvent(e.id)">🗑️</button>
          </div>
        </div>
        <div class="empty-state card" *ngIf="events.length === 0">
          <span class="empty-icon">📅</span>
          <p>Nenhum evento cadastrado</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px;
      font-size: 0.9rem; box-sizing: border-box; outline: none; font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .event-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.25rem; transition: background 0.2s; }
    .event-item:hover { background: #fafafa; }
    .event-date-badge { width: 50px; text-align: center; background: #e7f3ff; border-radius: 8px; padding: 0.4rem; flex-shrink: 0; }
    .event-day { display: block; font-size: 1.3rem; font-weight: 700; color: #1877f2; line-height: 1; }
    .event-month { font-size: 0.7rem; color: #1877f2; text-transform: uppercase; font-weight: 600; }
    .event-details { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
    .event-details strong { font-size: 0.95rem; }
    .event-time { font-size: 0.8rem; color: #65676b; }
    .event-location { font-size: 0.8rem; color: #65676b; }
    .event-desc { font-size: 0.8rem; color: #65676b; }
    .event-actions { display: flex; gap: 0.25rem; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class EventsComponent implements OnInit {
  events: GenericModuleItem[] = [];
  showForm = false;
  editingId: string | null = null;
  formData: GenericModuleRequest = { title: '', description: '', startDate: '', endDate: '', location: '' };
  private months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadEvents();
  }

  loadEvents(): void {
    this.moduleService.getAll('events').subscribe(r => { if (r.success && r.data) this.events = r.data; });
  }

  onSubmit(): void {
    if (this.editingId) {
      this.moduleService.update('events', this.editingId, this.formData).subscribe(() => { this.loadEvents(); this.cancel(); });
    } else {
      this.moduleService.create('events', this.formData).subscribe(() => { this.loadEvents(); this.cancel(); });
    }
  }

  edit(e: GenericModuleItem): void {
    this.editingId = e.id;
    this.formData = { title: e.title, description: e.description, startDate: e.startDate, endDate: e.endDate, location: e.location };
    this.showForm = true;
  }

  deleteEvent(id: string): void {
    if (confirm('Excluir evento?')) this.moduleService.delete('events', id).subscribe(() => this.loadEvents());
  }

  cancel(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { title: '', description: '', startDate: '', endDate: '', location: '' };
  }

  getDay(d?: string): string { return d ? new Date(d).getDate().toString() : '--'; }
  getMonth(d?: string): string { return d ? this.months[new Date(d).getMonth()] : ''; }
}
