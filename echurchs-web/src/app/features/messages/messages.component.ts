import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MessagingService } from '../../core/services/messaging.service';
import { Conversation, Message, SendMessageRequest } from '../../core/models/messaging.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="messages-page">
      <div class="page-header card">
        <h2>{{ chatTitle }}</h2>
        <span class="member-count" *ngIf="!isPrivateChat && memberCount">👥 {{ memberCount }} membros</span>
        <span class="member-count" *ngIf="isPrivateChat"><a routerLink="/friends" class="back-link">← Amigos</a></span>
      </div>

      <div class="chat-view card">
        <div class="chat-messages" #scrollContainer>
          <div class="chat-msg" *ngFor="let m of messages" [class.mine]="m.senderId === currentUserId">
            <div class="msg-avatar">{{ m.senderName.charAt(0) }}</div>
            <div class="msg-content">
              <div class="msg-header">
                <span class="msg-sender">{{ m.senderName }}</span>
                <span class="msg-time">{{ m.sentAt | date:'dd/MM HH:mm' }}</span>
              </div>
              <div class="msg-bubble">
                <p>{{ m.content }}</p>
              </div>
              <button class="msg-delete" *ngIf="m.senderId === currentUserId" (click)="deleteMessage(m.id)" title="Apagar">🗑️</button>
            </div>
          </div>
          <div class="no-msgs" *ngIf="messages.length === 0">
            <span class="empty-icon">💬</span>
            <p>Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" [(ngModel)]="newMessage" placeholder="Escreva uma mensagem..." (keyup.enter)="sendMessage()" maxlength="500">
          <button class="btn-send" (click)="sendMessage()" [disabled]="!newMessage.trim()">Enviar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-page { max-width: 720px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.1rem; }
    .member-count { font-size: 0.85rem; color: #65676b; }
    .chat-view { display: flex; flex-direction: column; height: 550px; overflow: hidden; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .chat-msg { display: flex; gap: 0.5rem; position: relative; }
    .chat-msg.mine { flex-direction: row-reverse; }
    .msg-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1877f2; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; flex-shrink: 0; }
    .chat-msg.mine .msg-avatar { background: #2ecc71; }
    .msg-content { max-width: 75%; }
    .msg-header { display: flex; gap: 0.5rem; align-items: baseline; margin-bottom: 0.15rem; }
    .chat-msg.mine .msg-header { flex-direction: row-reverse; }
    .msg-sender { font-size: 0.8rem; font-weight: 600; color: #1877f2; }
    .chat-msg.mine .msg-sender { color: #2ecc71; }
    .msg-time { font-size: 0.65rem; color: #65676b; }
    .msg-bubble { padding: 0.5rem 0.75rem; border-radius: 12px; background: #f0f2f5; }
    .chat-msg.mine .msg-bubble { background: #1877f2; color: white; }
    .msg-bubble p { margin: 0; font-size: 0.9rem; word-break: break-word; }
    .msg-delete { background: none; border: none; cursor: pointer; font-size: 0.7rem; padding: 0.15rem 0; opacity: 0; transition: opacity 0.15s; color: #e74c3c; }
    .msg-content:hover .msg-delete { opacity: 0.6; }
    .msg-delete:hover { opacity: 1 !important; }
    .no-msgs { text-align: center; color: #65676b; padding: 2.5rem; margin-top: auto; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .no-msgs p { font-size: 0.9rem; margin: 0; }
    .chat-input { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid #e4e6eb; }
    .chat-input input { flex: 1; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 20px; font-size: 0.9rem; outline: none; }
    .chat-input input:focus { border-color: #1877f2; }
    .btn-send { padding: 0.5rem 1.25rem; background: #1877f2; color: white; border: none; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .back-link { color: #1877f2; text-decoration: none; font-size: 0.85rem; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
  `]
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  currentUserId = '';
  memberCount = 0;
  communityChat: Conversation | null = null;
  chatTitle = 'Chat Geral da Comunidade';
  isPrivateChat = false;
  private routeSub: Subscription = new Subscription();

  constructor(private authService: AuthService, private messagingService: MessagingService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser?.id ?? '';
    const cid = this.authService.currentCommunityId;

    this.routeSub = this.route.queryParams.subscribe(params => {
      const convId = params['conv'];
      this.messages = [];
      this.communityChat = null;

      if (convId) {
        this.isPrivateChat = true;
        this.chatTitle = 'Conversa Privada';
        this.communityChat = { id: convId } as Conversation;
        this.loadMessages();
      } else if (cid) {
        this.isPrivateChat = false;
        this.chatTitle = 'Chat Geral da Comunidade';
        this.messagingService.getCommunityChat(cid).subscribe(r => {
          if (r.success && r.data) {
            this.communityChat = r.data;
            this.memberCount = r.data.participants?.length ?? 0;
            this.loadMessages();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  loadMessages(): void {
    if (!this.communityChat) return;
    this.messagingService.getMessages(this.communityChat.id).subscribe(r => {
      if (r.success && r.data) this.messages = r.data;
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.communityChat) return;
    const req: SendMessageRequest = { conversationId: this.communityChat.id, content: this.newMessage };
    this.messagingService.sendMessage(req).subscribe(r => {
      if (r.success && r.data) {
        this.messages.push(r.data);
        this.newMessage = '';
      }
    });
  }

  deleteMessage(messageId: string): void {
    if (confirm('Apagar esta mensagem?')) {
      this.messagingService.deleteMessage(messageId).subscribe(r => {
        if (r.success) this.messages = this.messages.filter(m => m.id !== messageId);
      });
    }
  }
}
