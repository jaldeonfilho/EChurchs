import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericModuleItem, GenericModuleRequest } from '../models/module.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private apiUrl = `${environment.apiUrl}/module`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get communityId(): string {
    return this.auth.currentCommunityId ?? '';
  }

  getTransactions(): Observable<ApiResponse<GenericModuleItem[]>> {
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/financial`);
  }

  getPersonalDonations(): Observable<ApiResponse<GenericModuleItem[]>> {
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/personal/donations`);
  }

  createTransaction(request: GenericModuleRequest): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.post<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${this.communityId}/financial/transaction`, request);
  }

  updateTransaction(id: string, request: GenericModuleRequest): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.put<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${this.communityId}/financial/transaction/${id}`, request);
  }

  deleteTransaction(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${this.communityId}/financial/transaction/${id}`);
  }

  getCategories(): Observable<ApiResponse<GenericModuleItem[]>> {
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/financial-categories`);
  }

  createCategory(request: GenericModuleRequest): Observable<ApiResponse<GenericModuleItem>> {
    return this.http.post<ApiResponse<GenericModuleItem>>(`${this.apiUrl}/${this.communityId}/financial-categories`, request);
  }
}
