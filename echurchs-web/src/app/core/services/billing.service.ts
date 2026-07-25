import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  Plan,
  PlanUsage,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse
} from '../models/billing.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get communityId(): string {
    return this.auth.currentCommunityId ?? '';
  }

  getPlans(): Observable<ApiResponse<Plan[]>> {
    return this.http.get<ApiResponse<Plan[]>>(`${this.apiUrl}/plans`);
  }

  getUsage(): Observable<ApiResponse<PlanUsage>> {
    return this.http.get<ApiResponse<PlanUsage>>(`${this.apiUrl}/${this.communityId}/usage`);
  }

  createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<ApiResponse<CheckoutSessionResponse>> {
    return this.http.post<ApiResponse<CheckoutSessionResponse>>(`${this.apiUrl}/${this.communityId}/checkout-session`, request);
  }

  createPortalSession(): Observable<ApiResponse<PortalSessionResponse>> {
    return this.http.post<ApiResponse<PortalSessionResponse>>(`${this.apiUrl}/${this.communityId}/portal-session`, {});
  }
}
