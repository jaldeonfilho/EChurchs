import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostRequest, FeedItem, FeedPage } from '../models/feed.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const NO_COMMUNITY_ID = '00000000-0000-0000-0000-000000000000';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private apiUrl = `${environment.apiUrl}/feed`;
  private uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getFeed(skip = 0, take = 20): Observable<ApiResponse<FeedPage>> {
    return this.http.get<ApiResponse<FeedPage>>(`${this.apiUrl}?skip=${skip}&take=${take}`);
  }

  createPost(request: CreatePostRequest): Observable<ApiResponse<FeedItem>> {
    return this.http.post<ApiResponse<FeedItem>>(this.apiUrl, request);
  }

  uploadMedia(file: File): Observable<{ success: boolean; url: string; fileName: string }> {
    const communityId = this.authService.currentCommunityId ?? NO_COMMUNITY_ID;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; url: string; fileName: string }>(
      `${this.uploadUrl}/${communityId}`,
      formData
    );
  }
}
