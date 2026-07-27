import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Community, CreateCommunityRequest, UpdateCommunityRequest, JoinCommunityRequest, MembershipResponse, MembershipActionRequest } from '../models/community.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private apiUrl = `${environment.apiUrl}/community`;

  constructor(private http: HttpClient) {}

  search(q?: string): Observable<ApiResponse<Community[]>> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<ApiResponse<Community[]>>(`${this.apiUrl}/search${params}`);
  }

  getById(id: string): Observable<ApiResponse<Community>> {
    return this.http.get<ApiResponse<Community>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCommunityRequest): Observable<ApiResponse<Community>> {
    return this.http.post<ApiResponse<Community>>(this.apiUrl, request);
  }

  update(id: string, request: UpdateCommunityRequest): Observable<ApiResponse<Community>> {
    return this.http.put<ApiResponse<Community>>(`${this.apiUrl}/${id}`, request);
  }

  join(request: JoinCommunityRequest): Observable<ApiResponse<MembershipResponse>> {
    return this.http.post<ApiResponse<MembershipResponse>>(`${this.apiUrl}/join`, request);
  }

  membershipAction(request: MembershipActionRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/membership/action`, request);
  }

  getPending(communityId: string): Observable<ApiResponse<MembershipResponse[]>> {
    return this.http.get<ApiResponse<MembershipResponse[]>>(`${this.apiUrl}/${communityId}/memberships/pending`);
  }

  getMembers(communityId: string): Observable<ApiResponse<MembershipResponse[]>> {
    return this.http.get<ApiResponse<MembershipResponse[]>>(`${this.apiUrl}/${communityId}/members`);
  }

  leave(): Observable<ApiResponse<MembershipResponse>> {
    return this.http.post<ApiResponse<MembershipResponse>>(`${this.apiUrl}/leave`, {});
  }
}
