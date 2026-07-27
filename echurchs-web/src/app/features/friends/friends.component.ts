import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessagingService } from '../../core/services/messaging.service';
import { Friendship, UserSearchResult } from '../../core/models/messaging.model';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-page">
      <div class="page-header card">
        <h2>Amigos</h2>
        <button class="btn-primary" (click)="showSearch = !showSearch">{{ showSearch ? 'Cancelar' : '+ Adicionar Amigo' }}</button>
      </div>

      <!-- Search -->
      <div class="form-card card" *ngIf="showSearch">
        <h3>Adicionar Amigo</h3>
        <input type="text" [(ngModel)]="searchQuery" (input)="searchUsers()" placeholder="Buscar pessoa por nome...">
        <div class="search-results" *ngIf="searchResults.length > 0">
          <div class="search-result" *ngFor="let u of searchResults">
            <div class="user-avatar">{{ u.name.charAt(0) }}</div>
            <div class="result-info">
              <strong>{{ u.name }}</strong>
              <span>{{ u.email }}</span>
            </div>
            <button class="btn-msg" (click)="openChat(u)" title="Enviar mensagem">💬</button>
            <button class="btn-add" (click)="sendRequest(u)">Adicionar</button>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="section-header" *ngIf="pendingFriends.length > 0">
        <h3>Solicitações Pendentes</h3>
      </div>
      <div class="friend-list" *ngIf="pendingFriends.length > 0">
        <div class="friend-card card" *ngFor="let f of pendingFriends">
          <div class="friend-avatar">{{ f.otherUserName.charAt(0) }}</div>
          <div class="friend-info">
            <strong>{{ f.otherUserName }}</strong>
            <span class="status-pending">Solicitação pendente</span>
          </div>
          <div class="friend-actions">
            <button class="btn-accept" (click)="acceptFriend(f)">Aceitar</button>
            <button class="btn-reject" (click)="rejectFriend(f)">Recusar</button>
          </div>
        </div>
      </div>

      <!-- Friends List -->
      <div class="section-header">
        <h3>Meus Amigos ({{ friends.length }})</h3>
      </div>
      <div class="friend-list">
        <div class="friend-card card" *ngFor="let f of friends">
          <div class="friend-avatar">{{ f.otherUserName.charAt(0) }}</div>
          <div class="friend-info" (click)="openChatById(f.otherUserId)" style="cursor:pointer">
            <strong>{{ f.otherUserName }}</strong>
            <span class="status-friend">Amigo · Clique para conversar</span>
          </div>
          <span class="friend-since">{{ f.createdAt | date:'dd/MM/yyyy' }}</span>
          <button class="btn-msg" (click)="openChatById(f.otherUserId)" title="Conversar">💬</button>
        </div>
        <div class="empty-state card" *ngIf="friends.length === 0 && pendingFriends.length === 0">
          <span class="empty-icon">🤝</span>
          <p>Nenhum amigo ainda</p>
          <button class="btn-primary-sm" (click)="showSearch = true">Adicionar primeiro amigo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .friends-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .section-header { margin-bottom: 0.5rem; }
    .section-header h3 { font-size: 0.9rem; color: #65676b; font-weight: 600; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-primary-sm { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .form-card input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; outline: none; box-sizing: border-box; }
    .form-card input:focus { border-color: #1877f2; }
    .search-results { margin-top: 0.5rem; max-height: 250px; overflow-y: auto; }
    .search-result { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; border-radius: 8px; }
    .search-result:hover { background: #f0f2f5; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
    .result-info { flex: 1; }
    .result-info strong { display: block; font-size: 0.9rem; }
    .result-info span { font-size: 0.8rem; color: #65676b; }
    .btn-add { padding: 0.35rem 0.75rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-left: 0.25rem; }
    .btn-msg { padding: 0.35rem 0.5rem; background: #e7f3ff; color: #1877f2; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
    .btn-msg:hover { background: #d0e4ff; }
    .friend-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .friend-avatar { width: 44px; height: 44px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .friend-info { flex: 1; }
    .friend-info strong { font-size: 0.95rem; display: block; }
    .friend-info strong:hover { color: #1877f2; }
    .status-pending { font-size: 0.8rem; color: #f39c12; }
    .status-friend { font-size: 0.78rem; color: #65676b; }
    .friend-since { font-size: 0.8rem; color: #65676b; }
    .friend-actions { display: flex; gap: 0.5rem; }
    .btn-accept { padding: 0.35rem 0.75rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-reject { padding: 0.35rem 0.75rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class FriendsComponent implements OnInit {
  friends: Friendship[] = [];
  pendingFriends: Friendship[] = [];
  showSearch = false;
  searchQuery = '';
  searchResults: UserSearchResult[] = [];

  constructor(private messagingService: MessagingService, private router: Router) {}

  ngOnInit(): void {
    this.loadFriends();
    this.loadPending();
  }

  loadFriends(): void {
    this.messagingService.getFriends().subscribe(r => { if (r.success && r.data) this.friends = r.data; });
  }

  loadPending(): void {
    this.messagingService.getPendingFriends().subscribe(r => { if (r.success && r.data) this.pendingFriends = r.data; });
  }

  searchUsers(): void {
    if (this.searchQuery.length < 2) { this.searchResults = []; return; }
    this.messagingService.searchUsers(this.searchQuery).subscribe(r => {
      if (r.success && r.data) this.searchResults = r.data;
    });
  }

  sendRequest(user: UserSearchResult): void {
    this.messagingService.sendFriendRequest({ addresseeUserId: user.id }).subscribe(r => {
      if (r.success) {
        alert('Solicitação enviada!');
        this.showSearch = false;
        this.searchQuery = '';
        this.searchResults = [];
      }
    });
  }

  acceptFriend(f: Friendship): void {
    this.messagingService.friendAction({ friendshipId: f.id, action: 'accept' }).subscribe(() => {
      this.loadFriends();
      this.loadPending();
    });
  }

  rejectFriend(f: Friendship): void {
    this.messagingService.friendAction({ friendshipId: f.id, action: 'reject' }).subscribe(() => {
      this.loadPending();
    });
  }

  openChat(user: UserSearchResult): void {
    this.startChat(user.id);
  }

  openChatById(userId: string): void {
    this.startChat(userId);
  }

  private startChat(userId: string): void {
    this.messagingService.startConversation({ recipientUserId: userId }).subscribe(r => {
      if (r.success && r.data) {
        this.router.navigate(['/messages'], { queryParams: { conv: r.data.id } });
      }
    });
  }
}
