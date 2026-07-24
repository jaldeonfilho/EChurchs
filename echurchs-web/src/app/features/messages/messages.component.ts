import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessagingService } from '../../core/services/messaging.service';
import { Conversation, Message, UserSearchResult, StartConversationRequest, SendMessageRequest } from '../../core/models/messaging.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-page">
      <div class="page-header card">
        <h2>Mensagens</h2>
        <button class="btn-primary" (click)="showNewChat = !showNewChat">{{ showNewChat ? 'Cancelar' : '+ Nova Conversa' }}</button>
      </div>

      <!-- New Chat Search -->
      <div class="form-card card" *ngIf="showNewChat">
        <h3>Iniciar Conversa</h3>
        <input type="text" [(ngModel)]="searchQuery" (input)="searchUsers()" placeholder="Buscar pessoa pelo nome...">
        <div class="search-results" *ngIf="searchResults.length > 0">
          <div class="search-result" *ngFor="let u of searchResults" (click)="startConversation(u)">
            <div class="user-avatar">{{ u.name.charAt(0) }}</div>
            <div>
              <strong>{{ u.name }}</strong>
              <span>{{ u.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Conversation List -->
      <div class="conversation-list" *ngIf="!selectedConversation">
        <div class="conversation-item card" *ngFor="let c of conversations" (click)="openConversation(c)">
          <div class="conv-avatar">{{ getConvName(c).charAt(0) }}</div>
          <div class="conv-info">
            <strong>{{ getConvName(c) }}</strong>
            <span class="conv-preview" *ngIf="c.lastMessage">{{ c.lastMessage.content }}</span>
            <span class="conv-preview empty" *ngIf="!c.lastMessage">Nenhuma mensagem</span>
          </div>
          <span class="conv-time" *ngIf="c.lastMessage">{{ c.lastMessage.sentAt | date:'HH:mm' }}</span>
        </div>
        <div class="empty-state card" *ngIf="conversations.length === 0">
          <span class="empty-icon">💬</span>
          <p>Nenhuma conversa ainda</p>
          <button class="btn-primary-sm" (click)="showNewChat = true">Iniciar conversa</button>
        </div>
      </div>

      <!-- Chat View -->
      <div class="chat-view card" *ngIf="selectedConversation">
        <div class="chat-header">
          <button class="btn-back" (click)="selectedConversation = null">←</button>
          <strong>{{ getConvName(selectedConversation) }}</strong>
        </div>
        <div class="chat-messages">
          <div class="chat-msg" *ngFor="let m of messages" [class.mine]="m.senderId === currentUserId">
            <div class="msg-bubble">
              <span class="msg-sender" *ngIf="m.senderId !== currentUserId">{{ m.senderName }}</span>
              <p>{{ m.content }}</p>
              <span class="msg-time">{{ m.sentAt | date:'HH:mm' }}</span>
            </div>
          </div>
          <div class="no-messages" *ngIf="messages.length === 0">Nenhuma mensagem ainda</div>
        </div>
        <div class="chat-input">
          <input type="text" [(ngModel)]="newMessage" placeholder="Escreva uma mensagem..." (keyup.enter)="sendMessage()">
          <button class="btn-send" (click)="sendMessage()" [disabled]="!newMessage.trim()">Enviar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-page { max-width: 680px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-primary-sm { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .form-card input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; outline: none; box-sizing: border-box; }
    .form-card input:focus { border-color: #1877f2; }
    .search-results { margin-top: 0.5rem; max-height: 250px; overflow-y: auto; }
    .search-result { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; border-radius: 8px; cursor: pointer; }
    .search-result:hover { background: #f0f2f5; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
    .search-result strong { display: block; font-size: 0.9rem; }
    .search-result span { font-size: 0.8rem; color: #65676b; }

    .conversation-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; cursor: pointer; transition: background 0.2s; }
    .conversation-item:hover { background: #f0f2f5; }
    .conv-avatar { width: 48px; height: 48px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
    .conv-info { flex: 1; min-width: 0; }
    .conv-info strong { font-size: 0.95rem; display: block; }
    .conv-preview { font-size: 0.8rem; color: #65676b; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .conv-preview.empty { font-style: italic; }
    .conv-time { font-size: 0.75rem; color: #65676b; flex-shrink: 0; }

    .chat-view { display: flex; flex-direction: column; height: 500px; overflow: hidden; }
    .chat-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-bottom: 1px solid #e4e6eb; }
    .btn-back { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.25rem; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .chat-msg { display: flex; }
    .chat-msg.mine { justify-content: flex-end; }
    .msg-bubble { max-width: 70%; padding: 0.5rem 0.75rem; border-radius: 12px; background: #e4e6eb; }
    .chat-msg.mine .msg-bubble { background: #1877f2; color: white; }
    .msg-sender { font-size: 0.75rem; font-weight: 600; color: #1877f2; display: block; margin-bottom: 0.1rem; }
    .msg-bubble p { margin: 0; font-size: 0.9rem; }
    .msg-time { font-size: 0.7rem; opacity: 0.6; display: block; text-align: right; margin-top: 0.15rem; }
    .no-messages { text-align: center; color: #65676b; padding: 2rem; }
    .chat-input { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid #e4e6eb; }
    .chat-input input { flex: 1; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 20px; font-size: 0.9rem; outline: none; }
    .chat-input input:focus { border-color: #1877f2; }
    .btn-send { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  `]
})
export class MessagesComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  showNewChat = false;
  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  currentUserId = '';

  constructor(private authService: AuthService, private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser?.id ?? '';
    this.loadConversations();
  }

  loadConversations(): void {
    this.messagingService.getConversations().subscribe(r => {
      if (r.success && r.data) this.conversations = r.data;
    });
  }

  openConversation(c: Conversation): void {
    this.selectedConversation = c;
    this.messagingService.getMessages(c.id).subscribe(r => {
      if (r.success && r.data) this.messages = r.data;
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    const req: SendMessageRequest = { conversationId: this.selectedConversation.id, content: this.newMessage };
    this.messagingService.sendMessage(req).subscribe(r => {
      if (r.success && r.data) {
        this.messages.push(r.data);
        this.newMessage = '';
      }
    });
  }

  searchUsers(): void {
    if (this.searchQuery.length < 2) { this.searchResults = []; return; }
    this.messagingService.searchUsers(this.searchQuery).subscribe(r => {
      if (r.success && r.data) this.searchResults = r.data;
    });
  }

  startConversation(user: UserSearchResult): void {
    this.messagingService.startConversation({ recipientUserId: user.id }).subscribe(r => {
      if (r.success && r.data) {
        this.showNewChat = false;
        this.searchQuery = '';
        this.searchResults = [];
        this.loadConversations();
        this.openConversation(r.data);
      }
    });
  }

  getConvName(c: Conversation): string {
    if (c.title) return c.title;
    const other = c.participants?.find(p => p.userId !== this.currentUserId);
    return other?.userName ?? 'Conversa';
  }
}
