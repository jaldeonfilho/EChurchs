import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModuleService } from '../../core/services/module.service';
import { FinancialService } from '../../core/services/financial.service';
import { CommunityService } from '../../core/services/community.service';
import { MembershipResponse } from '../../core/models/community.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feed-page">
      <!-- Post Composer -->
      <div class="composer card">
        <div class="composer-header">
          <div class="avatar">{{ userName.charAt(0) }}</div>
          <div class="composer-input" (click)="showComposer = !showComposer">
            O que está pensando?
          </div>
        </div>
        <div class="composer-actions">
          <button class="composer-btn" (click)="navigateTo('live')">📡 Ao Vivo</button>
          <button class="composer-btn" (click)="navigateTo('media')">📸 Foto/Vídeo</button>
          <button class="composer-btn" (click)="navigateTo('events')">📅 Evento</button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-card card" (click)="navigateTo('members')">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-number">{{ memberCount }}</span>
            <span class="stat-label">Membros</span>
          </div>
        </div>
        <div class="stat-card card" (click)="navigateTo('groups')">
          <div class="stat-icon">👨‍👩‍👧‍👦</div>
          <div class="stat-info">
            <span class="stat-number">{{ groupCount }}</span>
            <span class="stat-label">Grupos</span>
          </div>
        </div>
        <div class="stat-card card" (click)="navigateTo('events')">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <span class="stat-number">{{ eventCount }}</span>
            <span class="stat-label">Eventos</span>
          </div>
        </div>
        <div class="stat-card card" (click)="navigateTo('financial')">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-number">{{ transactionCount }}</span>
            <span class="stat-label">Transações</span>
          </div>
        </div>
      </div>

      <!-- Recent Bulletins (Feed Items) -->
      <div class="section-header">
        <h3>Últimos Avisos</h3>
        <a class="see-all" (click)="navigateTo('announcements')">Ver todos</a>
      </div>
      <div class="feed-items" *ngIf="bulletins.length > 0">
        <div class="feed-item card" *ngFor="let b of bulletins">
          <div class="feed-item-header">
            <div class="avatar avatar-sm">📢</div>
            <div>
              <strong>{{ b.title }}</strong>
              <span class="feed-date">{{ b.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <p class="feed-item-content">{{ b.content || b.description }}</p>
        </div>
      </div>
      <div class="empty-state card" *ngIf="bulletins.length === 0">
        <span class="empty-icon">📢</span>
        <p>Nenhum aviso recente</p>
        <button class="btn-primary-sm" (click)="navigateTo('announcements')">Criar primeiro aviso</button>
      </div>

      <!-- Upcoming Events -->
      <div class="section-header" *ngIf="events.length > 0">
        <h3>Próximos Eventos</h3>
        <a class="see-all" (click)="navigateTo('events')">Ver todos</a>
      </div>
      <div class="events-list" *ngIf="events.length > 0">
        <div class="event-item card" *ngFor="let e of events">
          <div class="event-date-badge">
            <span class="event-day">{{ getDay(e.startDate) }}</span>
            <span class="event-month">{{ getMonth(e.startDate) }}</span>
          </div>
          <div class="event-info">
            <strong>{{ e.title }}</strong>
            <span class="event-location" *ngIf="e.location">{{ e.location }}</span>
            <span class="event-time">{{ e.startDate | date:'HH:mm' }}</span>
          </div>
        </div>
      </div>

      <!-- Aniversariantes do Mês -->
      <div class="section-header" *ngIf="birthdayMembers.length > 0">
        <h3>Aniversariantes de {{ currentMonthName }}</h3>
        <span class="birthday-count">{{ birthdayMembers.length }}</span>
      </div>
      <div class="birthday-card card" *ngIf="birthdayMembers.length > 0">
        <div class="birthday-list">
          <div class="birthday-item" *ngFor="let m of birthdayMembers">
            <div class="birthday-avatar" [style.background]="getAvatarColor(m)">
              <img *ngIf="m.userProfileImage" [src]="m.userProfileImage" alt="" class="birthday-avatar-img">
              <span *ngIf="!m.userProfileImage">{{ getInitials(m) }}</span>
            </div>
            <div class="birthday-info">
              <span class="birthday-name">{{ m.userName }}</span>
              <span class="birthday-date">{{ getBirthdayDay(m) }} de {{ currentMonthName }}</span>
            </div>
            <div class="birthday-age" *ngIf="getBirthdayAge(m)">
              {{ getBirthdayAge(m) }} anos
            </div>
          </div>
        </div>
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
    }
    .composer-input {
      flex: 1;
      background: #f0f2f5;
      border-radius: 20px;
      padding: 0.6rem 1rem;
      color: #65676b;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .composer-input:hover { background: #e4e6eb; }
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
    .composer-btn:hover { background: #f0f2f5; }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .stat-card:hover { background: #f0f2f5; }
    .stat-icon { font-size: 1.5rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-number { font-size: 1.25rem; font-weight: 700; color: #1c1e21; }
    .stat-label { font-size: 0.75rem; color: #65676b; }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .section-header h3 { font-size: 1rem; color: #1c1e21; }
    .see-all { font-size: 0.85rem; color: #1877f2; cursor: pointer; font-weight: 500; }
    .see-all:hover { text-decoration: underline; }

    .feed-items { margin-bottom: 1.25rem; }
    .feed-item { padding: 1rem; }
    .feed-item-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .avatar-sm { width: 32px; height: 32px; font-size: 0.8rem; background: #1877f2; color: white; }
    .feed-item-header strong { display: block; font-size: 0.95rem; }
    .feed-date { font-size: 0.8rem; color: #65676b; }
    .feed-item-content { color: #1c1e21; font-size: 0.9rem; margin: 0; line-height: 1.5; }

    .empty-state {
      text-align: center;
      padding: 2rem;
    }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .empty-state p { color: #65676b; margin-bottom: 1rem; }
    .btn-primary-sm {
      padding: 0.5rem 1rem;
      background: #1877f2;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .events-list { margin-bottom: 1.25rem; }
    .event-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      cursor: pointer;
    }
    .event-item:hover { background: #f0f2f5; }
    .event-date-badge {
      width: 50px;
      text-align: center;
      background: #e7f3ff;
      border-radius: 8px;
      padding: 0.4rem;
      flex-shrink: 0;
    }
    .event-day { display: block; font-size: 1.3rem; font-weight: 700; color: #1877f2; line-height: 1; }
    .event-month { font-size: 0.7rem; color: #1877f2; text-transform: uppercase; font-weight: 600; }
    .event-info { display: flex; flex-direction: column; }
    .event-info strong { font-size: 0.95rem; }
    .event-location { font-size: 0.8rem; color: #65676b; }
    .event-time { font-size: 0.8rem; color: #65676b; }

    .birthday-count {
      background: #fff0f0;
      color: #e74c3c;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .birthday-card { padding: 0.5rem 1rem; }
    .birthday-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .birthday-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f2f5;
    }
    .birthday-item:last-child { border-bottom: none; }
    .birthday-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.8rem;
      color: white;
      flex-shrink: 0;
      overflow: hidden;
    }
    .birthday-avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .birthday-info { flex: 1; display: flex; flex-direction: column; }
    .birthday-name { font-size: 0.9rem; font-weight: 600; color: #1c1e21; }
    .birthday-date { font-size: 0.75rem; color: #65676b; }
    .birthday-age {
      font-size: 0.75rem;
      color: #e74c3c;
      font-weight: 600;
      background: #fff0f0;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class FeedComponent implements OnInit {
  userName = '';
  memberCount = 0;
  groupCount = 0;
  eventCount = 0;
  transactionCount = 0;
  bulletins: any[] = [];
  events: any[] = [];
  birthdayMembers: MembershipResponse[] = [];
  currentMonthName = '';
  showComposer = false;

  private months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  private monthsPT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  private avatarColors = ['#1877f2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private financialService: FinancialService,
    private communityService: CommunityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.currentUser?.name ?? '';
    this.currentMonthName = this.monthsPT[new Date().getMonth()];
    const cid = this.authService.currentCommunityId;
    if (!cid) return;

    this.communityService.getById(cid).subscribe(r => {
      if (r.success && r.data) this.memberCount = r.data.memberCount;
    });
    this.moduleService.getAll('groups').subscribe(r => { if (r.success && r.data) this.groupCount = r.data.length; });
    this.moduleService.getAll('events').subscribe(r => {
      if (r.success && r.data) {
        this.eventCount = r.data.length;
        this.events = r.data.slice(0, 3);
      }
    });
    this.moduleService.getAll('bulletins').subscribe(r => {
      if (r.success && r.data) this.bulletins = r.data.slice(0, 5);
    });
    this.financialService.getTransactions().subscribe(r => { if (r.success && r.data) this.transactionCount = r.data.length; });
    this.loadBirthdays(cid);
  }

  loadBirthdays(cid: string): void {
    this.communityService.getMembers(cid).subscribe(r => {
      if (r.success && r.data) {
        const now = new Date();
        const currentMonth = now.getMonth();
        this.birthdayMembers = r.data
          .filter(m => {
            if (!m.userDateOfBirth) return false;
            const dob = new Date(m.userDateOfBirth);
            return dob.getMonth() === currentMonth;
          })
          .sort((a, b) => {
            const dayA = new Date(a.userDateOfBirth!).getDate();
            const dayB = new Date(b.userDateOfBirth!).getDate();
            return dayA - dayB;
          });
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate(['/' + route]);
  }

  getDay(dateStr?: string): string {
    if (!dateStr) return '--';
    return new Date(dateStr).getDate().toString();
  }

  getMonth(dateStr?: string): string {
    if (!dateStr) return '';
    return this.months[new Date(dateStr).getMonth()];
  }

  getInitials(m: MembershipResponse): string {
    const parts = m.userName.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return m.userName.substring(0, 2).toUpperCase();
  }

  getAvatarColor(m: MembershipResponse): string {
    const idx = Math.abs(m.userId.charCodeAt(0) + (m.userId.charCodeAt(1) || 0)) % this.avatarColors.length;
    return this.avatarColors[idx];
  }

  getBirthdayDay(m: MembershipResponse): string {
    if (!m.userDateOfBirth) return '';
    return new Date(m.userDateOfBirth).getDate().toString();
  }

  getBirthdayAge(m: MembershipResponse): number | null {
    if (!m.userDateOfBirth) return null;
    const dob = new Date(m.userDateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}
