import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assets-page">
      <div class="page-header card">
        <h2>Patrimônio</h2>
        <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Novo Item' }}</button>
      </div>

      <div class="form-card card" *ngIf="showForm">
        <h3>Novo Item/Bem</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group"><label>Nome *</label><input type="text" [(ngModel)]="formData.name" name="name" required></div>
            <div class="form-group"><label>ID da Categoria</label><input type="text" [(ngModel)]="formData.categoryId" name="categoryId"></div>
          </div>
          <div class="form-group"><label>Descrição</label><input type="text" [(ngModel)]="formData.description" name="description"></div>
          <div class="form-row">
            <div class="form-group"><label>Valor</label><input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01"></div>
            <div class="form-group"><label>Localização</label><input type="text" [(ngModel)]="formData.location" name="location"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Cadastrar</button>
            <button type="button" class="btn-secondary" (click)="showForm = false">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="item-list" *ngIf="!showForm">
        <div class="item-card card" *ngFor="let a of assets">
          <div class="item-icon">🏢</div>
          <div class="item-info">
            <strong>{{ a.name }}</strong>
            <span>{{ a.categoryName || 'Sem categoria' }}{{ a.amount ? ' · ' + (a.amount | number:'1.2-2') + ' EUR' : '' }}</span>
          </div>
          <button class="btn-icon btn-danger" (click)="deleteAsset(a.id)">🗑️</button>
        </div>
        <div class="empty-state card" *ngIf="assets.length === 0"><span class="empty-icon">🏢</span><p>Nenhum item cadastrado</p></div>
      </div>
    </div>
  `,
  styles: [`
    .assets-page { max-width: 680px; margin: 0 auto; }
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
    .form-group input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none; }
    .form-group input:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .item-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .item-icon { font-size: 1.5rem; width: 40px; text-align: center; }
    .item-info { flex: 1; }
    .item-info strong { font-size: 0.95rem; display: block; }
    .item-info span { font-size: 0.8rem; color: #65676b; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class AssetsComponent implements OnInit {
  assets: GenericModuleItem[] = [];
  showForm = false;
  formData: GenericModuleRequest = { name: '', description: '', categoryId: '', amount: undefined, location: '' };

  constructor(private authService: AuthService, private moduleService: ModuleService) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadAssets();
  }

  loadAssets(): void {
    this.moduleService.getAll('assets').subscribe(r => { if (r.success && r.data) this.assets = r.data; });
  }

  onSubmit(): void {
    this.moduleService.create('assets', this.formData).subscribe(() => {
      this.loadAssets(); this.showForm = false;
      this.formData = { name: '', description: '', categoryId: '', amount: undefined, location: '' };
    });
  }

  deleteAsset(id: string): void {
    if (confirm('Excluir item?')) this.moduleService.delete('assets', id).subscribe(() => this.loadAssets());
  }
}
