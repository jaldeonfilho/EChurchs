export enum PostType {
  Live = 0,
  Media = 1,
  Event = 2
}

export interface FeedItem {
  id: string;
  source: 'Post' | 'CalendarEvent';
  postType?: 'Live' | 'Media' | 'Event';

  authorId: string;
  authorName: string;
  authorProfileImage?: string;

  communityId?: string;
  communityName?: string;
  communityLogoUrl?: string;

  content?: string;
  mediaUrl?: string;
  liveUrl?: string;

  eventTitle?: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;

  createdAt: string;
}

export interface FeedPage {
  items: FeedItem[];
  hasMore: boolean;
}

export interface CreatePostRequest {
  type: PostType;
  content?: string;
  mediaUrl?: string;
  liveUrl?: string;
  eventTitle?: string;
  eventDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
}
