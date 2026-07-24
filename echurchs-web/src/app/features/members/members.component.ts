import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';
import { MembershipResponse } from '../../core/models/community.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="members-page">
      <div class="page-header">
        <div class="header-left">
          <h2>Membros da Comunidade</h2>
          <span class="member-count">{{ filteredMembers.length }} membros</span>
        </div>
        <div class="header-actions">
          <span class="pending-badge" *ngIf="pendingCount > 0">
            {{ pendingCount }} pendente(s)
          </span>
        </div>
      </div>

      <div class="filters-row card">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por nome, email ou telefone..." (input)="applyFilters()">
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterRole" (change)="applyFilters()">
            <option value="">Todas as funções</option>
            <option value="Admin">Administrador</option>
            <option value="FinancialManager">Financeiro</option>
            <option value="Leader">Líder</option>
            <option value="Member">Membro</option>
          </select>
          <select [(ngModel)]="filterGender" (change)="applyFilters()">
            <option value="">Todos os géneros</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>
      </div>

      <div class="members-grid">
        <div class="member-card card" *ngFor="let member of filteredMembers">
          <div class="member-avatar" [style.background]="getAvatarColor(member)">
            <img *ngIf="member.userProfileImage" [src]="member.userProfileImage" alt="" class="avatar-img">
            <span *ngIf="!member.userProfileImage">{{ getInitials(member) }}</span>
          </div>
          <div class="member-info">
            <div class="member-name">{{ member.userName }}</div>
            <div class="member-role" [class]="'role-' + member.role.toLowerCase()">{{ getRoleName(member.role) }}</div>
            <div class="member-details">
              <span class="detail-item" *ngIf="member.userPhone">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ member.userPhone }}
              </span>
              <span class="detail-item" *ngIf="member.userEmail">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {{ member.userEmail }}
              </span>
            </div>
          </div>
          <div class="member-meta">
            <span class="status-dot" [class]="'status-' + member.status.toLowerCase()"></span>
            <span class="member-date">{{ member.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state card" *ngIf="filteredMembers.length === 0 && !loading">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p>Nenhum membro encontrado</p>
      </div>
    </div>
  `,
  styles: [`
    .members-page { max-width: 800px; margin: 0 auto; padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .header-left { display: flex; align-items: center; gap: 0.75rem; }
    .page-header h2 { margin: 0; font-size: 1.25rem; color: #1c1e21; }
    .member-count { background: #e7f3ff; color: #1877f2; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .pending-badge { background: #fff3cd; color: #856404; padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .filters-row { display: flex; gap: 0.75rem; padding: 0.75rem 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 0.5rem; background: #f0f2f5; border-radius: 20px; padding: 0 0.75rem; }
    .search-box svg { color: #65676b; flex-shrink: 0; }
    .search-box input { flex: 1; border: none; background: transparent; padding: 0.5rem 0; font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .filter-group { display: flex; gap: 0.5rem; }
    .filter-group select { padding: 0.4rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.8rem; background: white; color: #1c1e21; cursor: pointer; outline: none; }
    .filter-group select:focus { border-color: #1877f2; }
    .members-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .member-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; transition: background 0.15s; }
    .member-card:hover { background: #f0f2f5; }
    .member-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; color: white; flex-shrink: 0; overflow: hidden; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .member-info { flex: 1; min-width: 0; }
    .member-name { font-size: 0.95rem; font-weight: 600; color: #1c1e21; }
    .member-role { font-size: 0.75rem; font-weight: 600; margin-top: 1px; }
    .role-admin { color: #e74c3c; }
    .role-financialmanager { color: #f39c12; }
    .role-leader { color: #1877f2; }
    .role-member { color: #65676b; }
    .member-details { display: flex; gap: 0.75rem; margin-top: 3px; flex-wrap: wrap; }
    .detail-item { display: flex; align-items: center; gap: 3px; font-size: 0.75rem; color: #65676b; }
    .detail-item svg { color: #8a8d91; }
    .member-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-active { background: #31a24c; }
    .status-pending { background: #f7b928; }
    .status-rejected { background: #e74c3c; }
    .status-left { background: #bcc0c4; }
    .member-date { font-size: 0.7rem; color: #8a8d91; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: #65676b; }
    .empty-state svg { margin-bottom: 0.75rem; }
    .empty-state p { margin: 0; font-size: 0.95rem; }
    @media (max-width: 600px) {
      .filters-row { flex-direction: column; }
      .filter-group { flex-direction: column; }
      .member-details { flex-direction: column; gap: 2px; }
    }
  `]
})
export class MembersComponent implements OnInit {
  members: MembershipResponse[] = [];
  filteredMembers: MembershipResponse[] = [];
  searchQuery = '';
  filterRole = '';
  filterGender = '';
  pendingCount = 0;
  loading = false;

  private avatarColors = ['#1877f2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];

  constructor(private authService: AuthService, private communityService: CommunityService) {}

  ngOnInit(): void {
    const cid = this.authService.currentCommunityId;
    if (cid) {
      this.loadMembers(cid);
      this.loadPending(cid);
    }
  }

  loadMembers(cid: string): void {
    this.loading = true;
    this.communityService.getMembers(cid).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          this.members = r.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadPending(cid: string): void {
    this.communityService.getPending(cid).subscribe({
      next: (r) => { if (r.success && r.data) this.pendingCount = r.data.length; }
    });
  }

  applyFilters(): void {
    let result = this.members;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m =>
        m.userName.toLowerCase().includes(q) ||
        (m.userEmail && m.userEmail.toLowerCase().includes(q)) ||
        (m.userPhone && m.userPhone.includes(q))
      );
    }
    if (this.filterRole) {
      result = result.filter(m => m.role === this.filterRole);
    }
    if (this.filterGender) {
      result = result.filter(m => m.userGender === this.filterGender);
    }
    this.filteredMembers = result;
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

  getRoleName(role: string): string {
    const map: Record<string, string> = { Admin: 'Administrador', FinancialManager: 'Financeiro', Leader: 'Líder', Member: 'Membro' };
    return map[role] || role;
  }
}
