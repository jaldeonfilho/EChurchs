import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericModuleItem, GenericModuleRequest } from '../models/module.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private apiUrl = `${environment.apiUrl}/module`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get communityId(): string {
    return this.auth.currentCommunityId ?? '';
  }

  getAll(module: string): Observable<ApiResponse<GenericModuleItem[]>> {
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/${module}`);
  }

  getById(module: string, id: string): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.get<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${module}/${id}`);
  }

  create(module: string, request: GenericModuleRequest): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.post<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${this.communityId}/${module}`, request);
  }

  update(module: string, id: string, request: GenericModuleRequest): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.put<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${this.communityId}/${module}/${id}`, request);
  }

  delete(module: string, id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${module}/${id}`);
  }

  upload(file: File): Observable<{ success: boolean; url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; url: string; fileName: string }>(
      `${environment.apiUrl}/upload/${this.communityId}`, formData
    );
  }
}
