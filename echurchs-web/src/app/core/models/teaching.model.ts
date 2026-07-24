export interface Study {
  id: string;
  title: string;
  description?: string;
  content?: string;
  authorName: string;
  isPublished: boolean;
  attachmentCount: number;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}
