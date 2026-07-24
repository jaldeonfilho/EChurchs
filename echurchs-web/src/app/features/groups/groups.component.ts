import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="groups-page">
      <div class="page-header card">
        <h2>Grupos</h2>
        <div>
          <button class="btn-secondary" (click)="showCategoryForm = !showCategoryForm">
            {{ showCategoryForm ? 'Voltar' : '+ Categoria' }}
          </button>
          <button class="btn-primary" (click)="showForm = !showForm; showCategoryForm = false">
            {{ showForm ? 'Cancelar' : '+ Novo Grupo' }}
          </button>
        </div>
      </div>

      <div class="form-card card" *ngIf="showCategoryForm">
        <h3>{{ editingCategoryId ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
        <form (ngSubmit)="onCategorySubmit()">
          <div class="form-group"><label>Nome *</label><input type="text" [(ngModel)]="categoryForm.name" name="name" required></div>
          <div class="form-group"><label>Descrição</label><input type="text" [(ngModel)]="categoryForm.description" name="description"></div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editingCategoryId ? 'Salvar' : 'Cadastrar' }}</button>
            <button type="button" class="btn-secondary" (click)="cancelCategoryEdit()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="category-list" *ngIf="!showForm && !showCategoryForm && categories.length > 0">
        <span class="cat-label">Categorias:</span>
        <span class="cat-badge" *ngFor="let c of categories">{{ c.name }}</span>
      </div>

      <div class="form-card card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar Grupo' : 'Novo Grupo' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group"><label>Nome *</label><input type="text" [(ngModel)]="formData.name" name="name" required></div>
          <div class="form-group"><label>Descrição</label><input type="text" [(ngModel)]="formData.description" name="description"></div>
          <div class="form-group">
            <label>Categoria</label>
            <select [(ngModel)]="formData.categoryId" name="categoryId">
              <option value="">Sem categoria</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editingId ? 'Salvar' : 'Cadastrar' }}</button>
            <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="card-grid" *ngIf="!showForm && !showCategoryForm">
        <div class="group-card card" *ngFor="let group of groups">
          <div class="group-icon">👨‍👩‍👧‍👦</div>
          <div class="group-info">
            <strong>{{ group.name }}</strong>
            <span class="group-cat">{{ group.categoryName || 'Sem categoria' }}</span>
          </div>
          <div class="group-actions">
            <button class="btn-icon" (click)="edit(group)">✏️</button>
            <button class="btn-icon btn-danger" (click)="deleteGroup(group.id)">🗑️</button>
          </div>
        </div>
        <div class="empty-state card" *ngIf="groups.length === 0">
          <span class="empty-icon">👨‍👩‍👧‍👦</span>
          <p>Nenhum grupo cadastrado</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .groups-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input, .form-group select { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .card-grid { display: grid; gap: 0.75rem; }
    .group-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .group-icon { font-size: 1.5rem; width: 40px; text-align: center; }
    .group-info { flex: 1; }
    .group-info strong { font-size: 0.95rem; display: block; }
    .group-cat { font-size: 0.8rem; color: #65676b; }
    .group-actions { display: flex; gap: 0.25rem; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .category-list { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .cat-label { font-size: 0.85rem; font-weight: 600; color: #65676b; }
    .cat-badge { background: #e7f3ff; color: #1877f2; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
  `]
})
export class GroupsComponent implements OnInit {
  groups: GenericModuleItem[] = [];
  categories: GenericModuleItem[] = [];
  showForm = false;
  showCategoryForm = false;
  editingId: string | null = null;
  editingCategoryId: string | null = null;
  formData: GenericModuleRequest = { name: '', description: '', categoryId: '' };
  categoryForm: GenericModuleRequest = { name: '', description: '' };

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) {
      this.loadGroups();
      this.loadCategories();
    }
  }

  loadGroups(): void {
    this.moduleService.getAll('groups').subscribe(r => { if (r.success && r.data) this.groups = r.data; });
  }

  loadCategories(): void {
    this.moduleService.getAll('group-categories').subscribe(r => { if (r.success && r.data) this.categories = r.data; });
  }

  onSubmit(): void {
    const req: GenericModuleRequest = { ...this.formData };
    if (!req.categoryId) delete req.categoryId;
    if (this.editingId) {
      this.moduleService.update('groups', this.editingId, req).subscribe(() => { this.loadGroups(); this.cancelEdit(); });
    } else {
      this.moduleService.create('groups', req).subscribe(() => { this.loadGroups(); this.cancelEdit(); });
    }
  }

  onCategorySubmit(): void {
    if (this.editingCategoryId) {
      this.moduleService.update('group-categories', this.editingCategoryId, this.categoryForm).subscribe(() => { this.loadCategories(); this.cancelCategoryEdit(); });
    } else {
      this.moduleService.create('group-categories', this.categoryForm).subscribe(() => { this.loadCategories(); this.cancelCategoryEdit(); });
    }
  }

  edit(group: GenericModuleItem): void {
    this.editingId = group.id;
    this.formData = { name: group.name, description: group.description ?? '', categoryId: group.categoryId ?? '' };
    this.showForm = true;
  }

  deleteGroup(id: string): void {
    if (confirm('Tem certeza que deseja excluir?')) {
      this.moduleService.delete('groups', id).subscribe(() => this.loadGroups());
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { name: '', description: '', categoryId: '' };
  }

  cancelCategoryEdit(): void {
    this.showCategoryForm = false;
    this.editingCategoryId = null;
    this.categoryForm = { name: '', description: '' };
  }
}
