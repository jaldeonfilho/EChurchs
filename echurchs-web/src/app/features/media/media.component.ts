import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="media-page">
      <div class="page-header card">
        <h2>Mídias</h2>
        <button class="btn-primary" (click)="toggleForm()">
          <svg *ngIf="!showForm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          {{ showForm ? 'Cancelar' : '+ Adicionar' }}
        </button>
      </div>

      <div class="tabs card" *ngIf="!showForm">
        <button [class.active]="activeTab === 'photos'" (click)="activeTab = 'photos'">Fotos</button>
        <button [class.active]="activeTab === 'videos'" (click)="activeTab = 'videos'">Vídeos</button>
        <button [class.active]="activeTab === 'docs'" (click)="activeTab = 'docs'">Documentos</button>
      </div>

      <!-- Form: Videos (URL) -->
      <div class="form-card card" *ngIf="showForm && activeTab === 'videos'">
        <h3>{{ editingId ? 'Editar Vídeo' : 'Novo Vídeo' }}</h3>
        <form (ngSubmit)="onSubmitVideo()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="formData.title" name="title" placeholder="Ex: Louvor Domingo" required>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="2" placeholder="Descrição do vídeo..."></textarea>
          </div>
          <div class="form-group">
            <label>URL do Vídeo *</label>
            <input type="url" [(ngModel)]="formData.location" name="location" placeholder="https://youtube.com/watch?v=..." (input)="onUrlChange()" required>
          </div>
          <div class="url-preview" *ngIf="formData.location && previewType !== 'none'">
            <span class="preview-label">Plataforma:</span>
            <div class="preview-chip">
              <span class="preview-icon">{{ getPlatformIcon() }}</span>
              <span>{{ getPlatformName() }}</span>
            </div>
          </div>
          <div class="form-embed" *ngIf="formData.location">
            <iframe *ngIf="formEmbedUrl" [src]="formEmbedUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <div class="embed-fallback" *ngIf="!formEmbedUrl">
              <a [href]="formData.location" target="_blank" rel="noopener">{{ formData.location }}</a>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving">{{ saving ? 'A guardar...' : (editingId ? 'Guardar' : 'Criar') }}</button>
            <button type="button" class="btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Form: Photos (upload) -->
      <div class="form-card card" *ngIf="showForm && activeTab === 'photos'">
        <h3>{{ editingId ? 'Editar Foto' : 'Adicionar Foto' }}</h3>
        <form (ngSubmit)="onSubmitUpload('photos')">
          <div class="form-group">
            <label>Legenda</label>
            <input type="text" [(ngModel)]="formData.name" name="name" placeholder="Legenda da foto...">
          </div>
          <div class="form-group">
            <label>Ficheiro *</label>
            <div class="upload-area" (click)="fileInputPhoto.click()" [class.has-file]="selectedFile">
              <input #fileInputPhoto type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
              <div class="upload-content" *ngIf="!selectedFile && !uploading">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#65676b" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                <span>Clique para selecionar uma imagem</span>
                <span class="upload-hint">JPG, PNG, GIF (max 10MB)</span>
              </div>
              <div class="upload-content" *ngIf="selectedFile && !uploading">
                <img *ngIf="previewUrl" [src]="previewUrl" class="upload-preview-img">
                <span>{{ selectedFile.name }}</span>
                <button type="button" class="btn-remove" (click)="clearFile($event)">Remover</button>
              </div>
              <div class="upload-content" *ngIf="uploading">
                <span>A carregar...</span>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving || uploading">{{ saving ? 'A guardar...' : (editingId ? 'Guardar' : 'Criar') }}</button>
            <button type="button" class="btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Form: Documents (upload) -->
      <div class="form-card card" *ngIf="showForm && activeTab === 'docs'">
        <h3>{{ editingId ? 'Editar Documento' : 'Adicionar Documento' }}</h3>
        <form (ngSubmit)="onSubmitUpload('documents')">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="formData.name" name="name" placeholder="Nome do documento" required>
          </div>
          <div class="form-group">
            <label>Ficheiro *</label>
            <div class="upload-area" (click)="fileInputDoc.click()" [class.has-file]="selectedFile">
              <input #fileInputDoc type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" (change)="onFileSelected($event)" hidden>
              <div class="upload-content" *ngIf="!selectedFile && !uploading">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#65676b" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Clique para selecionar um documento</span>
                <span class="upload-hint">PDF, Word, Excel, PowerPoint (max 10MB)</span>
              </div>
              <div class="upload-content" *ngIf="selectedFile && !uploading">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1877f2" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                <button type="button" class="btn-remove" (click)="clearFile($event)">Remover</button>
              </div>
              <div class="upload-content" *ngIf="uploading">
                <span>A carregar...</span>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving || uploading">{{ saving ? 'A guardar...' : (editingId ? 'Guardar' : 'Criar') }}</button>
            <button type="button" class="btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Content: Videos Grid -->
      <div class="video-grid" *ngIf="!showForm && activeTab === 'videos'">
        <div class="video-card" *ngFor="let v of videos">
          <div class="video-thumb">
            <iframe *ngIf="getEmbed(v.id)" [src]="getEmbed(v.id)!" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            <div class="video-no-embed" *ngIf="!getEmbed(v.id)">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#65676b" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <a *ngIf="v.location" [href]="v.location" target="_blank" class="no-embed-link">Abrir link</a>
            </div>
          </div>
          <div class="video-info">
            <strong>{{ v.title }}</strong>
            <span>{{ v.description || 'Sem descrição' }}</span>
          </div>
          <div class="video-actions">
            <a *ngIf="v.location" [href]="v.location" target="_blank" class="btn-action" title="Abrir">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button class="btn-action" (click)="editVideo(v)" title="Editar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="btn-action btn-delete" (click)="deleteItem('videos', v.id)" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="empty-state full-width" *ngIf="videos.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <p>Nenhum vídeo adicionado</p>
          <button class="btn-primary-sm" (click)="toggleForm()">Adicionar primeiro vídeo</button>
        </div>
      </div>

      <!-- Content: Photos Grid -->
      <div class="photo-grid" *ngIf="!showForm && activeTab === 'photos'">
        <div class="photo-item" *ngFor="let p of photos">
          <img [src]="p.fileUrl" [alt]="p.title" class="photo-img" loading="lazy">
          <div class="photo-overlay">
            <span class="photo-caption">{{ p.title }}</span>
            <div class="photo-actions">
              <button class="btn-icon-sm" (click)="editPhoto(p)" title="Editar">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button class="btn-icon-sm btn-danger-sm" (click)="deleteItem('photos', p.id)" title="Eliminar">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="empty-state full-width" *ngIf="photos.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <p>Nenhuma foto adicionada</p>
          <button class="btn-primary-sm" (click)="toggleForm()">Adicionar primeira foto</button>
        </div>
      </div>

      <!-- Content: Documents -->
      <div class="doc-list" *ngIf="!showForm && activeTab === 'docs'">
        <div class="doc-card card" *ngFor="let d of documents">
          <div class="doc-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1877f2" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="doc-info">
            <strong>{{ d.title }}</strong>
            <a *ngIf="d.fileUrl" [href]="d.fileUrl" target="_blank" class="doc-link">Abrir documento</a>
          </div>
          <div class="doc-actions">
            <button class="btn-action" (click)="editDoc(d)" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="btn-action btn-delete" (click)="deleteItem('documents', d.id)" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="empty-state card" *ngIf="documents.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>Nenhum documento adicionado</p>
          <button class="btn-primary-sm" (click)="toggleForm()">Adicionar primeiro documento</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .media-page { max-width: 780px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { background: #a0c3ff; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn-primary-sm { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .tabs { display: flex; padding: 0; overflow: hidden; }
    .tabs button { flex: 1; padding: 0.65rem; background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #65676b; font-weight: 500; transition: all 0.2s; }
    .tabs button.active { background: #e7f3ff; color: #1877f2; font-weight: 600; }
    .tabs button:hover { background: #f0f2f5; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.8rem; color: #65676b; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.55rem 0.75rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { border-color: #1877f2; box-shadow: 0 0 0 1px #1877f2; }
    .form-group textarea { resize: vertical; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

    .url-preview { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .preview-label { font-size: 0.75rem; color: #65676b; }
    .preview-chip { display: flex; align-items: center; gap: 0.3rem; background: #f0f2f5; padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; color: #1c1e21; }
    .form-embed { margin-bottom: 0.75rem; border-radius: 8px; overflow: hidden; }
    .form-embed iframe { width: 100%; aspect-ratio: 16/9; border: none; border-radius: 8px; }
    .embed-fallback { padding: 1rem; background: #f0f2f5; border-radius: 8px; text-align: center; }
    .embed-fallback a { color: #1877f2; font-size: 0.85rem; word-break: break-all; }

    .upload-area {
      border: 2px dashed #dddfe2; border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer;
      transition: all 0.2s; display: flex; justify-content: center;
    }
    .upload-area:hover { border-color: #1877f2; background: #f0f7ff; }
    .upload-area.has-file { border-color: #1877f2; background: #f0f7ff; border-style: solid; }
    .upload-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #65676b; font-size: 0.85rem; }
    .upload-hint { font-size: 0.75rem; color: #bcc0c4; }
    .upload-preview-img { max-width: 200px; max-height: 150px; border-radius: 6px; object-fit: cover; }
    .btn-remove { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.8rem; font-weight: 500; padding: 0.2rem 0.5rem; }
    .btn-remove:hover { text-decoration: underline; }
    .file-size { font-size: 0.75rem; color: #bcc0c4; }

    .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
    .video-card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); overflow: hidden; }
    .video-thumb { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
    .video-thumb iframe { width: 100%; height: 100%; border: none; }
    .video-no-embed { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; gap: 0.4rem; background: #1c1e21; }
    .no-embed-link { color: #1877f2; font-size: 0.8rem; text-decoration: none; }
    .no-embed-link:hover { text-decoration: underline; }
    .video-info { padding: 0.6rem 0.75rem 0.25rem; }
    .video-info strong { display: block; font-size: 0.85rem; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .video-info span { font-size: 0.75rem; color: #65676b; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .video-actions { display: flex; gap: 0.15rem; padding: 0.35rem 0.5rem 0.5rem; justify-content: flex-end; }
    .btn-action { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: none; border-radius: 6px; cursor: pointer; color: #65676b; text-decoration: none; }
    .btn-action:hover { background: #f0f2f5; }
    .btn-delete:hover { background: #fce4e4; color: #e74c3c; }

    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }
    .photo-item { position: relative; border-radius: 10px; overflow: hidden; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); aspect-ratio: 1; }
    .photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 2rem 0.75rem 0.5rem; opacity: 0; transition: opacity 0.2s; }
    .photo-item:hover .photo-overlay { opacity: 1; }
    .photo-caption { color: white; font-size: 0.8rem; display: block; margin-bottom: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .photo-actions { display: flex; gap: 0.25rem; justify-content: flex-end; }
    .btn-icon-sm { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; background: rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer; }
    .btn-icon-sm:hover { background: rgba(255,255,255,0.4); }
    .btn-danger-sm:hover { background: rgba(231,76,60,0.8); }
    .full-width { grid-column: 1 / -1; }

    .doc-list { display: grid; gap: 0.5rem; }
    .doc-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .doc-icon { width: 40px; height: 40px; border-radius: 8px; background: #e7f3ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-info { flex: 1; }
    .doc-info strong { font-size: 0.9rem; display: block; }
    .doc-link { font-size: 0.8rem; color: #1877f2; text-decoration: none; display: block; margin-top: 0.1rem; }
    .doc-link:hover { text-decoration: underline; }
    .doc-actions { display: flex; gap: 0.15rem; }

    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-state svg { margin-bottom: 0.75rem; }
    .empty-state p { margin: 0 0 1rem; font-size: 0.95rem; }

    @media (max-width: 600px) {
      .video-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
      .photo-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    }
  `]
})
export class MediaComponent implements OnInit {
  activeTab = 'photos';
  showForm = false;
  editingId: string | null = null;
  saving = false;
  uploading = false;
  previewType: 'youtube' | 'vimeo' | 'facebook' | 'twitch' | 'dailymotion' | 'none' = 'none';
  formEmbedUrl: SafeResourceUrl | null = null;

  videos: GenericModuleItem[] = [];
  photos: GenericModuleItem[] = [];
  documents: GenericModuleItem[] = [];
  embedCache = new Map<string, SafeResourceUrl>();

  formData: GenericModuleRequest = { title: '', name: '', description: '', location: '', fileUrl: '' };
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadAll();
  }

  loadAll(): void {
    this.moduleService.getAll('videos').subscribe(r => {
      if (r.success && r.data) {
        this.videos = r.data;
        this.rebuildEmbedCache();
      }
    });
    this.moduleService.getAll('photos').subscribe(r => { if (r.success && r.data) this.photos = r.data; });
    this.moduleService.getAll('documents').subscribe(r => { if (r.success && r.data) this.documents = r.data; });
  }

  private rebuildEmbedCache(): void {
    this.embedCache.clear();
    for (const v of this.videos) {
      if (v.location) {
        const raw = this.extractEmbedUrl(v.location);
        if (raw) {
          this.embedCache.set(v.id, this.sanitizer.bypassSecurityTrustResourceUrl(raw));
        }
      }
    }
  }

  getEmbed(id: string): SafeResourceUrl | undefined {
    return this.embedCache.get(id);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelForm();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { title: '', name: '', description: '', location: '', fileUrl: '' };
    this.previewType = 'none';
    this.formEmbedUrl = null;
    this.clearFile(new Event('click'));
  }

  onSubmitVideo(): void {
    this.saving = true;
    const request: GenericModuleRequest = {
      title: this.formData.title, name: this.formData.title,
      description: this.formData.description, location: this.formData.location
    };
    const op = this.editingId
      ? this.moduleService.update('videos', this.editingId, request)
      : this.moduleService.create('videos', request);
    op.subscribe({
      next: () => { this.loadAll(); this.cancelForm(); this.saving = false; },
      error: () => { this.saving = false; }
    });
  }

  onSubmitUpload(module: string): void {
    if (!this.selectedFile && !this.editingId) return;
    this.saving = true;

    if (this.editingId) {
      const request: GenericModuleRequest = { name: this.formData.name, title: this.formData.name };
      this.moduleService.update(module, this.editingId, request).subscribe({
        next: () => { this.loadAll(); this.cancelForm(); this.saving = false; },
        error: () => { this.saving = false; }
      });
      return;
    }

    this.uploading = true;
    this.moduleService.upload(this.selectedFile!).subscribe({
      next: (res) => {
        const request: GenericModuleRequest = {
          name: this.formData.name || this.selectedFile?.name || '',
          title: this.formData.name || this.selectedFile?.name || '',
          fileUrl: res.url
        };
        this.moduleService.create(module, request).subscribe({
          next: () => { this.loadAll(); this.cancelForm(); this.uploading = false; this.saving = false; },
          error: () => { this.uploading = false; this.saving = false; }
        });
      },
      error: () => { this.uploading = false; this.saving = false; }
    });
  }

  editVideo(v: GenericModuleItem): void {
    this.editingId = v.id;
    this.formData = { title: v.title || '', name: v.title || '', description: v.description || '', location: v.location || '' };
    this.showForm = true;
    this.onUrlChange();
  }

  editPhoto(p: GenericModuleItem): void {
    this.editingId = p.id;
    this.formData = { name: p.title || '' };
    this.showForm = true;
  }

  editDoc(d: GenericModuleItem): void {
    this.editingId = d.id;
    this.formData = { name: d.title || '' };
    this.showForm = true;
  }

  deleteItem(moduleName: string, id: string): void {
    if (confirm('Eliminar este item?')) this.moduleService.delete(moduleName, id).subscribe(() => this.loadAll());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    if (this.selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.previewUrl = null;
    }
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  onUrlChange(): void {
    const url = this.formData.location || '';
    this.previewType = this.detectPlatform(url);
    const raw = this.extractEmbedUrl(url);
    this.formEmbedUrl = raw ? this.sanitizer.bypassSecurityTrustResourceUrl(raw) : null;
  }

  detectPlatform(url: string): 'youtube' | 'vimeo' | 'facebook' | 'twitch' | 'dailymotion' | 'none' {
    if (!url) return 'none';
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('vimeo.com')) return 'vimeo';
    if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
    if (u.includes('twitch.tv')) return 'twitch';
    if (u.includes('dai.ly') || u.includes('dailymotion.com')) return 'dailymotion';
    return 'none';
  }

  getPlatformIcon(): string {
    const icons: Record<string, string> = { youtube: '\u25B6\uFE0F', vimeo: '\uD83C\uDFAC', facebook: '\uD83D\uDCD8', twitch: '\uD83D\uDFE3', dailymotion: '\uD83D\uDCF9', none: '\uD83D\uDD17' };
    return icons[this.previewType] || '\uD83D\uDD17';
  }

  getPlatformName(): string {
    const names: Record<string, string> = { youtube: 'YouTube', vimeo: 'Vimeo', facebook: 'Facebook', twitch: 'Twitch', dailymotion: 'Dailymotion', none: '' };
    return names[this.previewType] || '';
  }

  private extractEmbedUrl(url: string): string | null {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0`;
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }
    const twitchMatch = url.match(/twitch\.tv\/(\w+)/);
    if (twitchMatch) return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}`;
    const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    const dmShort = url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
    if (dmShort) return `https://www.dailymotion.com/embed/video/${dmShort[1]}`;
    return null;
  }
}
