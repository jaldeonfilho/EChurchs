export interface Bulletin {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  status: string;
  publishDate: string;
  expiresAt?: string;
  createdAt: string;
}

export interface BulletinRequest {
  title: string;
  content: string;
  status: string;
  expiresAt?: string;
}
