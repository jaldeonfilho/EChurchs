export interface Group {
  id: string;
  name: string;
  description?: string;
  categoryName: string;
  categoryId: string;
  leaderName?: string;
  leaderId?: string;
  maxMembers?: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface GroupRequest {
  name: string;
  description?: string;
  categoryId: string;
  leaderId?: string;
  maxMembers?: number;
}
