import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="live-page">
      <div class="page-header">
        <div class="header-left">
          <h2>Cultos Online</h2>
          <span class="count-badge" *ngIf="services.length > 0">{{ services.length }}</span>
        </div>
        <button class="btn-primary" (click)="toggleForm()">
          <svg *ngIf="!showForm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          {{ showForm ? 'Cancelar' : 'Novo Culto' }}
        </button>
      </div>

      <!-- Form -->
      <div class="form-card card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar Culto' : 'Novo Culto' }}</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Título *</label>
            <input type="text" [(ngModel)]="formData.title" name="title" placeholder="Ex: Culto de Domingo" required>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="2" placeholder="Descrição do culto..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data/Hora *</label>
              <input type="datetime-local" [(ngModel)]="formData.startDate" name="startDate" required>
            </div>
            <div class="form-group">
              <label>Link da Transmissão</label>
              <input type="url" [(ngModel)]="formData.location" name="location" placeholder="https://youtube.com/watch?v=..." (input)="onUrlChange()">
            </div>
          </div>
          <div class="url-preview" *ngIf="formData.location && previewType !== 'none'">
            <span class="preview-label">Pré-visualização:</span>
            <div class="preview-chip">
              <span class="preview-icon">{{ getPlatformIcon() }}</span>
              <span>{{ getPlatformName() }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="saving">{{ saving ? 'A guardar...' : (editingId ? 'Guardar' : 'Criar') }}</button>
            <button type="button" class="btn-secondary" (click)="cancelForm()">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Service List -->
      <div class="service-list" *ngIf="!showForm">
        <div class="service-card card" *ngFor="let s of services">
          <div class="service-header">
            <div class="service-title-row">
              <div class="live-dot" [class.live]="isLive(s)"></div>
              <strong>{{ s.title }}</strong>
              <span class="live-badge" [class]="isLive(s) ? 'badge-live' : (isEnded(s) ? 'badge-ended' : 'badge-scheduled')">
                {{ isLive(s) ? 'AO VIVO' : (isEnded(s) ? 'Encerrado' : 'Agendado') }}
              </span>
            </div>
            <span class="service-date">{{ s.startDate | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <p class="service-desc" *ngIf="s.description">{{ s.description }}</p>

          <!-- Embedded Video Player -->
          <div class="video-embed" *ngIf="s.location && getEmbedUrl(s.location) as embedUrl">
            <div class="embed-container">
              <iframe
                [src]="embedUrl"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy">
              </iframe>
            </div>
            <a class="embed-link" [href]="s.location" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Abrir no {{ getPlatformNameForUrl(s.location) }}
            </a>
          </div>

          <!-- No URL - just show link -->
          <div class="service-link" *ngIf="s.location && !getEmbedUrl(s.location)">
            <a [href]="s.location" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              {{ s.location }}
            </a>
          </div>

          <div class="service-actions">
            <button class="btn-go-live" *ngIf="!isLive(s) && !isEnded(s)" (click)="goLive(s)">Iniciar culto</button>
            <button class="btn-end-live" *ngIf="isLive(s)" (click)="endLive(s)">Encerrar</button>
            <button class="btn-action" (click)="editService(s)" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button class="btn-action btn-delete" (click)="deleteService(s.id)" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div class="empty-state card" *ngIf="services.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <p>Nenhum culto online agendado</p>
          <button class="btn-primary-sm" (click)="toggleForm()">Agendar primeiro culto</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-page { max-width: 680px; margin: 0 auto; padding: 1rem; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .header-left { display: flex; align-items: center; gap: 0.5rem; }
    .page-header h2 { margin: 0; font-size: 1.25rem; color: #1c1e21; }
    .count-badge { background: #e7f3ff; color: #1877f2; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }

    .btn-primary { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { background: #a0c3ff; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn-secondary:hover { background: #d8dadf; }
    .btn-primary-sm { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }

    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; color: #1c1e21; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.8rem; color: #65676b; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #dddfe2; border-radius: 6px;
      font-size: 0.875rem; box-sizing: border-box; outline: none; font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: #1877f2; box-shadow: 0 0 0 1px #1877f2; }
    .form-group textarea { resize: vertical; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

    .url-preview { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .preview-label { font-size: 0.75rem; color: #65676b; }
    .preview-chip { display: flex; align-items: center; gap: 0.3rem; background: #f0f2f5; padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; color: #1c1e21; }
    .preview-icon { font-size: 0.9rem; }

    .service-card { padding: 1rem 1.25rem; }
    .service-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .service-title-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .service-title-row strong { font-size: 1rem; color: #1c1e21; }
    .service-date { font-size: 0.8rem; color: #65676b; flex-shrink: 0; }
    .service-desc { font-size: 0.875rem; color: #65676b; margin: 0 0 0.75rem; line-height: 1.4; }

    .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #bcc0c4; flex-shrink: 0; }
    .live-dot.live { background: #e74c3c; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .live-badge { padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.5px; flex-shrink: 0; }
    .badge-live { background: #fce4e4; color: #e74c3c; }
    .badge-ended { background: #e2e3e5; color: #6c757d; }
    .badge-scheduled { background: #e7f3ff; color: #1877f2; }

    .btn-go-live { padding: 0.35rem 0.7rem; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-right: auto; }
    .btn-go-live:hover { background: #d33d2c; }
    .btn-end-live { padding: 0.35rem 0.7rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-right: auto; }
    .btn-end-live:hover { background: #d8dadf; }

    .video-embed { margin-bottom: 0.75rem; }
    .embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #000; }
    .embed-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; }
    .embed-link {
      display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem;
      font-size: 0.8rem; color: #1877f2; text-decoration: none; font-weight: 500;
    }
    .embed-link:hover { text-decoration: underline; }

    .service-link {
      margin-bottom: 0.75rem;
    }
    .service-link a {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-size: 0.85rem; color: #1877f2; text-decoration: none; word-break: break-all;
    }
    .service-link a:hover { text-decoration: underline; }

    .service-actions { display: flex; gap: 0.25rem; justify-content: flex-end; border-top: 1px solid #f0f2f5; padding-top: 0.5rem; }
    .btn-action {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border: none; background: none; border-radius: 6px; cursor: pointer; color: #65676b;
    }
    .btn-action:hover { background: #f0f2f5; }
    .btn-delete:hover { background: #fce4e4; color: #e74c3c; }

    .empty-state { text-align: center; padding: 3rem 1rem; color: #65676b; }
    .empty-state svg { margin-bottom: 0.75rem; }
    .empty-state p { margin: 0 0 1rem; font-size: 0.95rem; }

    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class LiveComponent implements OnInit {
  services: GenericModuleItem[] = [];
  showForm = false;
  editingId: string | null = null;
  saving = false;
  previewType: 'youtube' | 'vimeo' | 'facebook' | 'twitch' | 'dailymotion' | 'iframe' | 'none' = 'none';

  formData: GenericModuleRequest = { title: '', description: '', startDate: '', location: '' };

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.authService.currentCommunityId) this.loadServices();
  }

  loadServices(): void {
    this.moduleService.getAll('live-services').subscribe(r => {
      if (r.success && r.data) this.services = r.data;
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelForm();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { title: '', description: '', startDate: '', location: '' };
    this.previewType = 'none';
  }

  onSubmit(): void {
    this.saving = true;
    if (this.editingId) {
      this.moduleService.update('live-services', this.editingId, this.formData).subscribe({
        next: () => { this.loadServices(); this.cancelForm(); this.saving = false; },
        error: () => { this.saving = false; }
      });
    } else {
      this.moduleService.create('live-services', this.formData).subscribe({
        next: () => { this.loadServices(); this.cancelForm(); this.saving = false; },
        error: () => { this.saving = false; }
      });
    }
  }

  editService(s: GenericModuleItem): void {
    this.editingId = s.id;
    this.formData = {
      title: s.title || '',
      description: s.description || '',
      startDate: s.startDate ? s.startDate.substring(0, 16) : '',
      location: s.location || ''
    };
    this.showForm = true;
    this.onUrlChange();
  }

  deleteService(id: string): void {
    if (confirm('Eliminar este culto online?')) {
      this.moduleService.delete('live-services', id).subscribe(() => this.loadServices());
    }
  }

  isLive(s: GenericModuleItem): boolean {
    return s.metadata?.['status'] === 'Live';
  }

  isEnded(s: GenericModuleItem): boolean {
    const status = s.metadata?.['status'];
    return status === 'Ended' || status === 'Cancelled';
  }

  goLive(s: GenericModuleItem): void {
    this.moduleService.update('live-services', s.id, { metadata: { status: 'Live' } }).subscribe({
      next: () => this.loadServices(),
      error: () => {}
    });
  }

  endLive(s: GenericModuleItem): void {
    this.moduleService.update('live-services', s.id, { metadata: { status: 'Ended' } }).subscribe({
      next: () => this.loadServices(),
      error: () => {}
    });
  }

  onUrlChange(): void {
    this.previewType = this.detectPlatform(this.formData.location || '');
  }

  detectPlatform(url: string): 'youtube' | 'vimeo' | 'facebook' | 'twitch' | 'dailymotion' | 'iframe' | 'none' {
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
    const icons: Record<string, string> = { youtube: '▶️', vimeo: '🎬', facebook: '📘', twitch: '🟣', dailymotion: '📹', none: '🔗' };
    return icons[this.previewType] || '🔗';
  }

  getPlatformName(): string {
    const names: Record<string, string> = { youtube: 'YouTube', vimeo: 'Vimeo', facebook: 'Facebook', twitch: 'Twitch', dailymotion: 'Dailymotion', none: '' };
    return names[this.previewType] || '';
  }

  getPlatformNameForUrl(url: string): string {
    const platform = this.detectPlatform(url);
    const names: Record<string, string> = { youtube: 'YouTube', vimeo: 'Vimeo', facebook: 'Facebook', twitch: 'Twitch', dailymotion: 'Dailymotion' };
    return names[platform] || 'site original';
  }

  getEmbedUrl(url: string): SafeResourceUrl | null {
    const embedUrl = this.extractEmbedUrl(url);
    if (!embedUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractEmbedUrl(url: string): string | null {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0`;

    // Facebook
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }

    // Twitch
    const twitchMatch = url.match(/twitch\.tv\/(\w+)/);
    if (twitchMatch) return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}`;

    // Dailymotion
    const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    const dmShort = url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
    if (dmShort) return `https://www.dailymotion.com/embed/video/${dmShort[1]}`;

    return null;
  }
}
