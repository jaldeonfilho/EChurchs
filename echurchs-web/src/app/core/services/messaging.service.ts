import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friendship, FriendRequest, FriendActionRequest, Conversation, StartConversationRequest, SendMessageRequest, Message, UserSearchResult } from '../models/messaging.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private apiUrl = `${environment.apiUrl}/messaging`;

  constructor(private http: HttpClient) {}

  sendFriendRequest(request: FriendRequest): Observable<ApiResponse<Friendship>> {
    return this.http.post<ApiResponse<Friendship>>(`${this.apiUrl}/friend-request`, request);
  }

  friendAction(request: FriendActionRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/friend/action`, request);
  }

  getFriends(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(`${this.apiUrl}/friends`);
  }

  getPendingFriends(): Observable<ApiResponse<Friendship[]>> {
    return this.http.get<ApiResponse<Friendship[]>>(`${this.apiUrl}/friends/pending`);
  }

  startConversation(request: StartConversationRequest): Observable<ApiResponse<Conversation>> {
    return this.http.post<ApiResponse<Conversation>>(`${this.apiUrl}/conversation`, request);
  }

  getConversations(): Observable<ApiResponse<Conversation[]>> {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.apiUrl}/conversations`);
  }

  getCommunityChat(communityId: string): Observable<ApiResponse<Conversation>> {
    return this.http.get<ApiResponse<Conversation>>(`${this.apiUrl}/community-chat/${communityId}`);
  }

  getMessages(conversationId: string): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/conversation/${conversationId}/messages`);
  }

  sendMessage(request: SendMessageRequest): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.apiUrl}/message`, request);
  }

  deleteMessage(messageId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/message/${messageId}`);
  }

  searchUsers(q: string): Observable<ApiResponse<UserSearchResult[]>> {
    return this.http.get<ApiResponse<UserSearchResult[]>>(`${this.apiUrl}/users/search?q=${encodeURIComponent(q)}`);
  }
}
