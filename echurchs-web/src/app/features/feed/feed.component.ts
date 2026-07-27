import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';
import { CreatePostRequest, FeedItem, PostType } from '../../core/models/feed.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="feed-page">
      <!-- Post Composer -->
      <div class="composer card">
        <div class="composer-header">
          <div class="avatar">{{ userName.charAt(0) }}</div>
          <div class="composer-input">O que está a acontecer na tua igreja?</div>
        </div>
        <div class="composer-actions">
          <button class="composer-btn" [class.active]="activeForm === 'live'" (click)="toggleForm('live')">📡 Ao Vivo</button>
          <button class="composer-btn" [class.active]="activeForm === 'media'" (click)="toggleForm('media')">📸 Foto/Vídeo</button>
          <button class="composer-btn" [class.active]="activeForm === 'event'" (click)="toggleForm('event')">📅 Evento</button>
        </div>

        <!-- Ao Vivo form -->
        <div class="composer-form" *ngIf="activeForm === 'live'">
          <textarea [(ngModel)]="draft.content" placeholder="Sobre esta transmissão (opcional)" class="form-input" rows="2"></textarea>
          <input type="text" [(ngModel)]="draft.liveUrl" placeholder="Link do YouTube" class="form-input">
          <div class="form-actions">
            <button class="btn-secondary" (click)="cancelForm()">Cancelar</button>
            <button class="btn-primary" (click)="submitPost()" [disabled]="!draft.liveUrl || posting">
              {{ posting ? 'A publicar...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <!-- Foto/Vídeo form -->
        <div class="composer-form" *ngIf="activeForm === 'media'">
          <textarea [(ngModel)]="draft.content" placeholder="Legenda (opcional)" class="form-input" rows="2"></textarea>
          <input type="file" accept="image/*,video/*" (change)="onFileSelected($event)" class="form-input">
          <p class="uploading-hint" *ngIf="uploading">A enviar ficheiro...</p>
          <p class="uploading-hint" *ngIf="draft.mediaUrl && !uploading">Ficheiro pronto ✓</p>
          <div class="form-actions">
            <button class="btn-secondary" (click)="cancelForm()">Cancelar</button>
            <button class="btn-primary" (click)="submitPost()" [disabled]="!draft.mediaUrl || posting || uploading">
              {{ posting ? 'A publicar...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <!-- Evento form -->
        <div class="composer-form" *ngIf="activeForm === 'event'">
          <input type="text" [(ngModel)]="draft.eventTitle" placeholder="Título do evento" class="form-input">
          <textarea [(ngModel)]="draft.content" placeholder="Descrição (opcional)" class="form-input" rows="2"></textarea>
          <div class="form-row">
            <input type="datetime-local" [(ngModel)]="draft.eventDate" class="form-input">
            <input type="text" [(ngModel)]="draft.eventLocation" placeholder="Local (opcional)" class="form-input">
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="cancelForm()">Cancelar</button>
            <button class="btn-primary" (click)="submitPost()" [disabled]="!draft.eventTitle || !draft.eventDate || posting">
              {{ posting ? 'A publicar...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <p class="form-error" *ngIf="formError">{{ formError }}</p>
      </div>

      <!-- Feed list -->
      <div class="feed-items" *ngIf="items.length > 0">
        <div class="feed-item card" *ngFor="let item of items">
          <div class="feed-item-header">
            <div class="avatar avatar-sm">
              <img *ngIf="item.authorProfileImage" [src]="item.authorProfileImage" alt="">
              <span *ngIf="!item.authorProfileImage">{{ item.authorName.charAt(0) }}</span>
            </div>
            <div class="feed-item-author">
              <div class="author-row">
                <strong>{{ item.authorName }}</strong>
                <span class="community-badge" *ngIf="item.communityName">{{ item.communityName }}</span>
              </div>
              <span class="feed-date">{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>

          <p class="feed-item-content" *ngIf="item.content">{{ item.content }}</p>

          <div class="post-live" *ngIf="item.postType === 'Live' && item.liveUrl">
            <span class="live-badge">🔴 AO VIVO</span>
            <a [href]="item.liveUrl" target="_blank" rel="noopener">Assistir no YouTube</a>
          </div>

          <div class="post-media" *ngIf="item.postType === 'Media' && item.mediaUrl">
            <video *ngIf="isVideo(item.mediaUrl)" [src]="item.mediaUrl" controls></video>
            <img *ngIf="!isVideo(item.mediaUrl)" [src]="item.mediaUrl" alt="">
          </div>

          <div class="post-event" *ngIf="item.eventTitle">
            <span class="event-source">{{ item.source === 'CalendarEvent' ? '📅 Evento da comunidade' : '📅 Evento' }}</span>
            <strong>{{ item.eventTitle }}</strong>
            <span class="event-date" *ngIf="item.eventDate">{{ item.eventDate | date:'dd/MM/yyyy HH:mm' }}</span>
            <span class="event-location" *ngIf="item.eventLocation">📍 {{ item.eventLocation }}</span>
          </div>
        </div>

        <button class="btn-load-more" *ngIf="hasMore" (click)="loadMore()" [disabled]="loading">
          {{ loading ? 'A carregar...' : 'Carregar mais' }}
        </button>
      </div>

      <div class="empty-state card" *ngIf="items.length === 0 && !loading">
        <span class="empty-icon">📰</span>
        <p>Ainda não há publicações. Sê o primeiro a partilhar algo!</p>
      </div>
    </div>
  `,
  styles: [`
    .feed-page { max-width: 680px; margin: 0 auto; }

    .card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .composer { margin-bottom: 1.25rem; }
    .composer-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e4e6eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #65676b;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .composer-input {
      flex: 1;
      background: #f0f2f5;
      border-radius: 20px;
      padding: 0.6rem 1rem;
      color: #65676b;
      font-size: 0.95rem;
    }
    .composer-actions {
      display: flex;
      justify-content: space-around;
      padding-top: 0.75rem;
      border-top: 1px solid #e4e6eb;
    }
    .composer-btn {
      background: none;
      border: none;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      color: #65676b;
      font-weight: 500;
      transition: background 0.2s;
    }
    .composer-btn:hover, .composer-btn.active { background: #f0f2f5; color: #1877f2; }

    .composer-form { border-top: 1px solid #e4e6eb; padding-top: 0.75rem; margin-top: 0.75rem; }
    .form-input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1px solid #dddfe2;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 0.6rem;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-input:focus { border-color: #1877f2; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .form-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
    .form-error { color: #e74c3c; font-size: 0.85rem; margin-top: 0.5rem; }
    .uploading-hint { font-size: 0.8rem; color: #65676b; margin: -0.3rem 0 0.6rem; }

    .btn-primary {
      padding: 0.55rem 1.4rem;
      background: #1877f2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.55rem 1.2rem;
      background: #e4e6eb;
      color: #1c1e21;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .feed-items { display: flex; flex-direction: column; }
    .feed-item { padding: 1rem; }
    .feed-item-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
    .avatar-sm { width: 36px; height: 36px; font-size: 0.85rem; background: #1877f2; color: white; }
    .feed-item-author { display: flex; flex-direction: column; }
    .author-row { display: flex; align-items: center; gap: 0.5rem; }
    .author-row strong { font-size: 0.95rem; }
    .community-badge {
      background: #e7f3ff;
      color: #1877f2;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
    }
    .feed-date { font-size: 0.78rem; color: #65676b; }
    .feed-item-content { color: #1c1e21; font-size: 0.92rem; margin: 0 0 0.6rem; line-height: 1.5; }

    .post-live { display: flex; align-items: center; gap: 0.75rem; background: #fff0f0; padding: 0.6rem 0.9rem; border-radius: 8px; }
    .live-badge { color: #e74c3c; font-weight: 700; font-size: 0.8rem; }
    .post-live a { color: #1877f2; font-weight: 600; font-size: 0.85rem; text-decoration: none; }
    .post-live a:hover { text-decoration: underline; }

    .post-media img, .post-media video { width: 100%; border-radius: 8px; max-height: 480px; object-fit: cover; }

    .post-event {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      background: #f0f7ff;
      padding: 0.75rem 0.9rem;
      border-radius: 8px;
    }
    .event-source { font-size: 0.75rem; color: #1877f2; font-weight: 600; }
    .post-event strong { font-size: 0.95rem; color: #1c1e21; }
    .event-date, .event-location { font-size: 0.82rem; color: #65676b; }

    .btn-load-more {
      align-self: center;
      padding: 0.5rem 1.5rem;
      background: white;
      border: 1px solid #dddfe2;
      border-radius: 8px;
      color: #1877f2;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .btn-load-more:disabled { opacity: 0.6; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 2.5rem 1rem; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .empty-state p { color: #65676b; }
  `]
})
export class FeedComponent implements OnInit {
  userName = '';
  items: FeedItem[] = [];
  hasMore = false;
  loading = false;
  posting = false;
  uploading = false;
  formError = '';

  activeForm: 'live' | 'media' | 'event' | null = null;
  draft: CreatePostRequest = { type: PostType.Live };

  private pageSize = 20;

  constructor(private authService: AuthService, private feedService: FeedService) {}

  ngOnInit(): void {
    this.userName = this.authService.currentUser?.name ?? '';
    this.loadFeed();
  }

  loadFeed(): void {
    this.loading = true;
    this.feedService.getFeed(0, this.pageSize).subscribe({
      next: r => {
        this.loading = false;
        if (r.success && r.data) {
          this.items = r.data.items;
          this.hasMore = r.data.hasMore;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadMore(): void {
    this.loading = true;
    this.feedService.getFeed(this.items.length, this.pageSize).subscribe({
      next: r => {
        this.loading = false;
        if (r.success && r.data) {
          this.items = [...this.items, ...r.data.items];
          this.hasMore = r.data.hasMore;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  toggleForm(form: 'live' | 'media' | 'event'): void {
    this.activeForm = this.activeForm === form ? null : form;
    this.formError = '';
    this.draft = { type: form === 'live' ? PostType.Live : form === 'media' ? PostType.Media : PostType.Event };
  }

  cancelForm(): void {
    this.activeForm = null;
    this.formError = '';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.feedService.uploadMedia(file).subscribe({
      next: res => {
        this.uploading = false;
        if (res.success) this.draft.mediaUrl = res.url;
      },
      error: () => {
        this.uploading = false;
        this.formError = 'Erro ao enviar o ficheiro';
      }
    });
  }

  submitPost(): void {
    this.posting = true;
    this.formError = '';
    this.feedService.createPost(this.draft).subscribe({
      next: r => {
        this.posting = false;
        if (r.success && r.data) {
          this.items = [r.data, ...this.items];
          this.activeForm = null;
        } else {
          this.formError = r.message || 'Erro ao publicar';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.posting = false;
        this.formError = err.error?.message || 'Erro ao conectar com o servidor';
      }
    });
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }
}
