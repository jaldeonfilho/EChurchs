import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';
import { MembershipResponse } from '../../core/models/community.model';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Pessoas</h1>
    </div>

    <div class="search-bar">
      <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por nome..." (input)="onSearch()">
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Função</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="members.length === 0"><td colspan="3" class="empty">Nenhum membro encontrado</td></tr>
          <tr *ngFor="let member of filteredMembers">
            <td>{{ member.communityName }}</td>
            <td>{{ member.role }}</td>
            <td><span [class]="'badge ' + (member.status === 'Active' ? 'badge-active' : 'badge-inactive')">{{ member.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-bar input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 1rem; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; color: #555; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .badge-active { background: #d4edda; color: #155724; }
    .badge-inactive { background: #f8d7da; color: #721c24; }
  `]
})
export class PeopleComponent implements OnInit {
  members: MembershipResponse[] = [];
  filteredMembers: MembershipResponse[] = [];
  searchQuery = '';
  private communityId = '';

  constructor(private authService: AuthService, private communityService: CommunityService) {}

  ngOnInit(): void {
    this.communityId = this.authService.currentCommunityId ?? '';
    if (this.communityId) this.loadMembers();
  }

  loadMembers(): void {
    this.communityService.getMembers(this.communityId).subscribe(r => {
      if (r.success && r.data) {
        this.members = r.data;
        this.filteredMembers = r.data;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredMembers = this.members;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredMembers = this.members.filter(m =>
      m.communityName.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }
}
