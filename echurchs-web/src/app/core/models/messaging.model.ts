export interface Friendship {
  id: string;
  otherUserId: string;
  otherUserName: string;
  status: string;
  createdAt: string;
}

export interface FriendRequest {
  addresseeUserId: string;
}

export interface FriendActionRequest {
  friendshipId: string;
  action: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
}

export interface StartConversationRequest {
  recipientUserId?: string;
  participantIds?: string[];
  title?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}
