import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericModuleItem, GenericModuleRequest } from '../models/module.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { MembershipResponse } from '../models/community.model';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private apiUrl = `${environment.apiUrl}/module`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get communityId(): string {
    return this.auth.currentCommunityId ?? '';
  }

  getTransactions(referenceMonth?: number, referenceYear?: number, memberId?: string): Observable<ApiResponse<GenericModuleItem[]>> {
    let params = new HttpParams();
    if (referenceMonth !== undefined) params = params.set('referenceMonth', referenceMonth.toString());
    if (referenceYear !== undefined) params = params.set('referenceYear', referenceYear.toString());
    if (memberId) params = params.set('filterUserId', memberId);
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/financial`, { params });
  }

  getPersonalDonations(): Observable<ApiResponse<GenericModuleItem[]>> {
    return this.http.get<ApiResponse<GenericModuleItem[]>>(`${this.apiUrl}/${this.communityId}/personal/donations`);
  }

  getMembersList(): Observable<ApiResponse<MembershipResponse[]>> {
    return this.http.get<ApiResponse<MembershipResponse[]>>(`${this.apiUrl}/${this.communityId}/members/list`);
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
