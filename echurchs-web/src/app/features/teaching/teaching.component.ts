import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-teaching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="teaching-page">
      <div class="page-header card">
        <h2>Ensino</h2>
        <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Adicionar' }}</button>
      </div>

      <div class="tabs card" *ngIf="!showForm">
        <button [class.active]="activeTab === 'studies'" (click)="activeTab = 'studies'">📖 Estudos</button>
        <button [class.active]="activeTab === 'classes'" (click)="activeTab = 'classes'">🎓 Turmas</button>
      </div>

      <div class="form-card card" *ngIf="showForm">
        <h3>{{ activeTab === 'studies' ? 'Novo Estudo' : 'Nova Turma' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group"><label>Nome/Título *</label><input type="text" [(ngModel)]="formData.name" name="name" required></div>
          <div class="form-group"><label>Descrição</label><input type="text" [(ngModel)]="formData.description" name="description"></div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Criar</button>
            <button type="button" class="btn-secondary" (click)="showForm = false">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="item-list" *ngIf="!showForm">
        <ng-container *ngIf="activeTab === 'studies'">
          <div class="item-card card" *ngFor="let s of studies">
            <div class="item-icon">📖</div>
            <div class="item-info">
              <strong>{{ s.name }}</strong>
              <span>{{ s.description || 'Sem descrição' }}</span>
            </div>
            <span class="status-dot" [class.active]="s.isActive"></span>
            <button class="btn-icon btn-danger" (click)="deleteItem('studies', s.id)">🗑️</button>
          </div>
          <div class="empty-state card" *ngIf="studies.length === 0"><span class="empty-icon">📖</span><p>Nenhum estudo</p></div>
        </ng-container>
        <ng-container *ngIf="activeTab === 'classes'">
          <div class="item-card card" *ngFor="let c of classes">
            <div class="item-icon">🎓</div>
            <div class="item-info">
              <strong>{{ c.name }}</strong>
              <span>{{ c.description || 'Sem descrição' }}</span>
            </div>
            <span class="status-dot" [class.active]="c.isActive"></span>
            <button class="btn-icon btn-danger" (click)="deleteItem('classes', c.id)">🗑️</button>
          </div>
          <div class="empty-state card" *ngIf="classes.length === 0"><span class="empty-icon">🎓</span><p>Nenhuma turma</p></div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .teaching-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }
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
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .item-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .item-icon { font-size: 1.5rem; width: 40px; text-align: center; }
    .item-info { flex: 1; }
    .item-info strong { font-size: 0.95rem; display: block; }
    .item-info span { font-size: 0.8rem; color: #65676b; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #e4e6eb; flex-shrink: 0; }
    .status-dot.active { background: #27ae60; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class TeachingComponent implements OnInit {
  activeTab = 'studies';
  studies: GenericModuleItem[] = [];
  classes: GenericModuleItem[] = [];
  showForm = false;
  formData: GenericModuleRequest = { name: '', description: '' };

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadData();
  }

  loadData(): void {
    this.moduleService.getAll('studies').subscribe(r => { if (r.success && r.data) this.studies = r.data; });
    this.moduleService.getAll('classes').subscribe(r => { if (r.success && r.data) this.classes = r.data; });
  }

  onSubmit(): void {
    const moduleName = this.activeTab === 'studies' ? 'studies' : 'classes';
    this.moduleService.create(moduleName, this.formData).subscribe(() => {
      this.loadData(); this.showForm = false; this.formData = { name: '', description: '' };
    });
  }

  deleteItem(moduleName: string, id: string): void {
    if (confirm('Excluir item?')) this.moduleService.delete(moduleName, id).subscribe(() => this.loadData());
  }
}
