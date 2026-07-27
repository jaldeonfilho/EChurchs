import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <!-- Main App (feed é público: renderiza sempre, com ou sem comunidade) -->
    <div class="app-layout">
      <!-- Top Navbar -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="topbar-logo">⛪</span>
          <span class="topbar-brand">Echurchs</span>
        </div>
        <div class="topbar-center">
          <div class="community-badge" *ngIf="communityName">
            <span class="community-initial">{{ communityName.charAt(0) }}</span>
            <span class="community-name">{{ communityName }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="user-menu" (click)="showUserMenu = !showUserMenu">
            <div class="user-avatar">{{ userName.charAt(0) }}</div>
            <span class="user-name">{{ userName }}</span>
            <div class="dropdown-menu" *ngIf="showUserMenu">
              <a routerLink="/settings" (click)="showUserMenu = false">⚙️ Configurações</a>
              <a (click)="logout()">🚪 Sair</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="app-body">
        <!-- Left Sidebar -->
        <aside class="left-sidebar">
          <nav class="sidebar-nav">
            <a routerLink="/feed" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🏠</span>
              <span>Feed</span>
            </a>
            <a routerLink="/community" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">⛪</span>
              <span>A Comunidade</span>
            </a>
            <a routerLink="/members" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👥</span>
              <span>Membros</span>
            </a>
            <a routerLink="/groups" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👨‍👩‍👧‍👦</span>
              <span>Grupos</span>
            </a>
            <a routerLink="/events" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📅</span>
              <span>Eventos</span>
            </a>
            <a routerLink="/announcements" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📢</span>
              <span>Avisos</span>
            </a>
            <a routerLink="/media" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📸</span>
              <span>Mídias</span>
            </a>
            <a routerLink="/teaching" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📖</span>
              <span>Ensino</span>
            </a>
            <a routerLink="/live" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📡</span>
              <span>Cultos Online</span>
            </a>

            <div class="nav-divider"></div>
            <div class="nav-section-title">Financeiro</div>
            <div class="nav-expandable" [class.expanded]="financialExpanded">
              <a class="nav-item nav-parent" (click)="financialExpanded = !financialExpanded">
                <span class="nav-icon">💰</span>
                <span>Financeiro</span>
                <span class="nav-arrow">{{ financialExpanded ? '▼' : '▶' }}</span>
              </a>
              <div class="sub-nav" *ngIf="financialExpanded">
                <a routerLink="/financial" [queryParams]="{tab:'entradas'}" routerLinkActive="active" class="nav-item sub-item">
                  <span class="nav-icon">📥</span>
                  <span>Entradas</span>
                </a>
                <a routerLink="/financial" [queryParams]="{tab:'saidas'}" routerLinkActive="active" class="nav-item sub-item">
                  <span class="nav-icon">📤</span>
                  <span>Saídas</span>
                </a>
                <a routerLink="/financial" [queryParams]="{tab:'balanco'}" routerLinkActive="active" class="nav-item sub-item">
                  <span class="nav-icon">📊</span>
                  <span>Balanço Geral</span>
                </a>
              </div>
            </div>
            <a routerLink="/donations" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💝</span>
              <span>Doações</span>
            </a>
            <a routerLink="/billing" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💳</span>
              <span>Faturação</span>
            </a>

            <div class="nav-divider"></div>
            <div class="nav-section-title">Comunicação</div>
            <a routerLink="/messages" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">💬</span>
              <span>Mensagens</span>
            </a>
            <a routerLink="/friends" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🤝</span>
              <span>Amigos</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>

        <!-- Right Sidebar (Quick Info) -->
        <aside class="right-sidebar">
          <ng-container *ngIf="hasCommunity">
            <div class="sidebar-card">
              <h4>Minha Comunidade</h4>
              <div class="community-info">
                <div class="community-avatar">{{ communityName.charAt(0) }}</div>
                <div>
                  <strong>{{ communityName }}</strong>
                  <span class="member-count">{{ memberCount }} membros</span>
                </div>
              </div>
            </div>
            <div class="sidebar-card">
              <h4>Meu Plano</h4>
              <p class="plan-name">{{ planName || 'Free' }}</p>
              <a routerLink="/billing" class="btn-upgrade">Fazer upgrade</a>
            </div>
          </ng-container>

          <div class="sidebar-card" *ngIf="!hasCommunity">
            <h4>A minha comunidade</h4>
            <p class="onboarding-hint">Ainda não pertences a nenhuma comunidade.</p>
            <div class="onboarding-compact-actions">
              <button class="btn-primary" (click)="showCreate = true; showSearch = false">➕ Criar Comunidade</button>
              <button class="btn-secondary" (click)="showSearch = true; showCreate = false">🔍 Entrar numa Comunidade</button>
            </div>

            <!-- Create Community Form -->
            <div class="onboarding-form" *ngIf="showCreate">
              <input type="text" [(ngModel)]="newCommunityName" placeholder="Nome da igreja" class="form-input">
              <textarea [(ngModel)]="newCommunityDesc" placeholder="Descrição (opcional)" class="form-input" rows="2"></textarea>
              <input type="text" [(ngModel)]="newCommunityNipc" placeholder="NIPC (opcional)" class="form-input">
              <input type="text" [(ngModel)]="newCommunityPhone" placeholder="Telefone (opcional)" class="form-input">
              <input type="text" [(ngModel)]="newCommunityAddress" placeholder="Endereço (opcional)" class="form-input">
              <div class="form-actions">
                <button class="btn-secondary" (click)="showCreate = false">Cancelar</button>
                <button class="btn-primary" (click)="createCommunity()" [disabled]="!newCommunityName || loading">
                  {{ loading ? 'Criando...' : 'Criar' }}
                </button>
              </div>
              <div class="form-error" *ngIf="formError">{{ formError }}</div>
            </div>

            <!-- Search Community -->
            <div class="onboarding-form" *ngIf="showSearch">
              <input type="text" [(ngModel)]="searchTerm" (input)="searchCommunities()" placeholder="Buscar por nome..." class="form-input">
              <div class="search-results" *ngIf="searchResults.length > 0">
                <div class="search-item" *ngFor="let c of searchResults" (click)="selectCommunity(c)">
                  <div class="search-item-avatar">{{ c.name.charAt(0) }}</div>
                  <div class="search-item-info">
                    <strong>{{ c.name }}</strong>
                    <span>{{ c.memberCount }} membros</span>
                  </div>
                  <button class="btn-small" (click)="joinCommunity(c.id); $event.stopPropagation()">Entrar</button>
                </div>
              </div>
              <p class="no-results" *ngIf="searchTerm && searchResults.length === 0 && !loadingSearch">Nenhuma comunidade encontrada</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ONBOARDING (compact, sidebar) ========== */
    .onboarding-hint { font-size: 0.85rem; color: #65676b; margin-bottom: 0.75rem; }
    .onboarding-compact-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
    .onboarding-compact-actions button { width: 100%; }
    .onboarding-form {
      border-top: 1px solid #e4e6eb;
      padding-top: 1rem;
      margin-top: 0.75rem;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #dddfe2;
      border-radius: 8px;
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus { border-color: #1877f2; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
    .form-error { color: #e74c3c; font-size: 0.875rem; margin-top: 0.5rem; }

    .btn-primary {
      padding: 0.6rem 1.5rem;
      background: #1877f2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      padding: 0.6rem 1.5rem;
      background: #e4e6eb;
      color: #1c1e21;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #d8dadf; }

    .search-results { margin-top: 0.75rem; max-height: 300px; overflow-y: auto; }
    .search-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .search-item:hover { background: #f0f2f5; }
    .search-item-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1877f2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .search-item-info { flex: 1; }
    .search-item-info strong { display: block; font-size: 0.95rem; }
    .search-item-info span { font-size: 0.8rem; color: #65676b; }
    .btn-small {
      padding: 0.4rem 0.8rem;
      background: #1877f2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .no-results { color: #65676b; font-size: 0.9rem; margin-top: 0.5rem; }

    /* ========== APP LAYOUT ========== */
    .app-layout { min-height: 100vh; display: flex; flex-direction: column; }

    /* Top Navbar */
    .topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      z-index: 100;
    }
    .topbar-left { display: flex; align-items: center; gap: 0.5rem; }
    .topbar-logo { font-size: 1.5rem; }
    .topbar-brand { font-size: 1.3rem; font-weight: 700; color: #1877f2; }
    .topbar-center { flex: 1; display: flex; justify-content: center; }
    .community-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f0f2f5;
      padding: 0.3rem 1rem 0.3rem 0.3rem;
      border-radius: 20px;
    }
    .community-initial {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1877f2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
    }
    .community-name { font-weight: 600; font-size: 0.9rem; color: #1c1e21; }
    .topbar-right { position: relative; }
    .user-menu { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.3rem; border-radius: 20px; transition: background 0.2s; }
    .user-menu:hover { background: #f0f2f5; }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e4e6eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .user-name { font-weight: 500; font-size: 0.9rem; }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-width: 200px;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
    }
    .dropdown-menu a {
      display: block;
      padding: 0.6rem 1rem;
      color: #1c1e21;
      font-size: 0.9rem;
      text-decoration: none;
    }
    .dropdown-menu a:hover { background: #f0f2f5; text-decoration: none; }

    /* Body */
    .app-body {
      display: flex;
      margin-top: 56px;
      min-height: calc(100vh - 56px);
    }

    /* Left Sidebar */
    .left-sidebar {
      width: 260px;
      position: fixed;
      top: 56px;
      left: 0;
      bottom: 0;
      overflow-y: auto;
      padding: 1rem 0.5rem;
      background: white;
      border-right: 1px solid #e4e6eb;
    }
    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: #1c1e21;
      font-size: 0.95rem;
      font-weight: 500;
      text-decoration: none;
      transition: background 0.2s;
    }
    .nav-item:hover { background: #f0f2f5; text-decoration: none; }
    .nav-item.active { background: #e7f3ff; color: #1877f2; }
    .nav-icon { font-size: 1.2rem; width: 24px; text-align: center; }
    .nav-divider { height: 1px; background: #e4e6eb; margin: 0.5rem 0.75rem; }
    .nav-expandable { display: flex; flex-direction: column; }
    .nav-expandable.expanded > .nav-parent { background: #e7f3ff; color: #1877f2; }
    .nav-parent { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 8px; color: #1c1e21; font-size: 0.95rem; font-weight: 500; text-decoration: none; transition: background 0.2s; cursor: pointer; }
    .nav-parent:hover { background: #f0f2f5; text-decoration: none; }
    .sub-nav { padding-left: 0.75rem; }
    .sub-item { font-size: 0.88rem; padding: 0.45rem 0.75rem; margin: 1px 0; }
    .sub-item .nav-icon { font-size: 1rem; width: 20px; }
    .nav-arrow { margin-left: auto; font-size: 0.7rem; color: #65676b; }
    .nav-section-title {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #65676b;
      letter-spacing: 0.5px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      margin-right: 280px;
      padding: 1.5rem;
      max-width: 100%;
    }

    /* Right Sidebar */
    .right-sidebar {
      width: 280px;
      position: fixed;
      top: 56px;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      padding: 1rem;
      background: white;
      border-left: 1px solid #e4e6eb;
    }
    .sidebar-card {
      background: #f0f2f5;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .sidebar-card h4 {
      font-size: 0.85rem;
      color: #65676b;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .community-info { display: flex; align-items: center; gap: 0.75rem; }
    .community-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1877f2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .community-info strong { display: block; font-size: 1rem; }
    .member-count { font-size: 0.8rem; color: #65676b; }
    .plan-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1877f2;
    }
    .btn-upgrade {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.35rem 0.8rem;
      background: #1877f2;
      color: white;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
    }
    .btn-upgrade:hover { background: #166fe5; }

    /* Responsive */
    @media (max-width: 1200px) {
      .right-sidebar { display: none; }
      .main-content { margin-right: 0; }
    }
    @media (max-width: 900px) {
      .left-sidebar { display: none; }
      .main-content { margin-left: 0; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  hasCommunity = false;
  communityName = '';
  memberCount = 0;
  planName = '';
  userName = '';
  showUserMenu = false;
  financialExpanded = false;

  showCreate = false;
  showSearch = false;
  newCommunityName = '';
  newCommunityDesc = '';
  newCommunityNipc = '';
  newCommunityPhone = '';
  newCommunityAddress = '';
  searchTerm = '';
  searchResults: any[] = [];
  formError = '';
  loading = false;
  loadingSearch = false;

  constructor(
    private authService: AuthService,
    private communityService: CommunityService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showUserMenu) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.showUserMenu = false;
      }
    }
  }

  ngOnInit(): void {
    this.userName = this.authService.currentUser?.name ?? '';
    this.checkCommunity();
  }

  checkCommunity(): void {
    const communityId = this.authService.currentCommunityId;
    if (communityId) {
      this.hasCommunity = true;
      this.communityName = this.authService.currentCommunityName ?? '';
      this.communityService.getById(communityId).subscribe(r => {
        if (r.success && r.data) {
          this.memberCount = r.data.memberCount;
          this.planName = r.data.planName ?? 'Free';
        }
      });
    } else {
      this.hasCommunity = false;
    }
  }

  createCommunity(): void {
    this.loading = true;
    this.formError = '';
    this.communityService.create({
      name: this.newCommunityName,
      description: this.newCommunityDesc,
      nipc: this.newCommunityNipc || undefined,
      phone: this.newCommunityPhone || undefined,
      address: this.newCommunityAddress || undefined
    }).subscribe({
      next: (r) => {
        this.loading = false;
        if (r.success && r.data) {
          // Reload user data to get updated membership
          const user = this.authService.currentUser;
          if (user && user.memberships) {
            user.memberships.push({
              id: '',
              communityId: r.data.id,
              communityName: r.data.name,
              role: 'Admin',
              status: 'Active',
              createdAt: new Date().toISOString()
            });
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authService.refreshUser();
          }
          this.checkCommunity();
        } else {
          this.formError = r.message || 'Erro ao criar comunidade';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Community creation error:', err);
        this.loading = false;
        if (err.error?.message) {
          this.formError = err.error.message;
        } else if (err.error?.errors?.length) {
          this.formError = err.error.errors.join(', ');
        } else {
          this.formError = 'Erro ao conectar com o servidor';
        }
      }
    });
  }

  searchCommunities(): void {
    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }
    this.loadingSearch = true;
    this.communityService.search(this.searchTerm).subscribe(r => {
      this.loadingSearch = false;
      if (r.success && r.data) {
        this.searchResults = r.data;
      }
    });
  }

  selectCommunity(c: any): void {}

  joinCommunity(communityId: string): void {
    this.communityService.join({ communityId }).subscribe({
      next: (r) => {
        if (r.success) {
          alert('Solicitação enviada! Aguarde aprovação do administrador.');
          this.showSearch = false;
          this.searchTerm = '';
          this.searchResults = [];
        } else {
          alert(r.message || 'Erro ao solicitar entrada');
        }
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || 'Erro ao solicitar entrada';
        alert(msg);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
