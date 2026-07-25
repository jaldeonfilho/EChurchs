export type BillingCycle = 'Monthly' | 'Yearly';

export interface PlanLimitItem {
  module: string;
  feature: string;
  limitValue: number;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceYearly?: number;
  description?: string;
  limits: PlanLimitItem[];
}

export interface PlanUsageItem {
  module: string;
  feature: string;
  limitValue: number;
  currentUsage: number;
  isUnlimited: boolean;
  description?: string;
}

export interface PlanUsage {
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  items: PlanUsageItem[];
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingCycle: BillingCycle;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}
