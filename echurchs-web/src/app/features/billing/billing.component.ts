import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BillingService } from '../../core/services/billing.service';
import { Plan, PlanUsage, PlanUsageItem, BillingCycle } from '../../core/models/billing.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="billing-page">
      <div class="page-header">
        <h2>Planos e Faturação</h2>
      </div>

      <div class="banner banner-success" *ngIf="checkoutBanner === 'success'">
        ✅ Pagamento confirmado! Pode levar alguns segundos até o novo plano aparecer.
        <button class="btn-link" (click)="refreshUsage()">Atualizar</button>
      </div>
      <div class="banner banner-cancel" *ngIf="checkoutBanner === 'cancel'">
        O checkout foi cancelado. Nenhuma alteração foi feita ao teu plano.
      </div>

      <!-- Current plan usage -->
      <div class="card usage-card" *ngIf="usage">
        <div class="usage-header">
          <div>
            <h3>Plano atual: {{ usage.planName }}</h3>
            <span class="status-badge" [class]="'status-' + usage.status.toLowerCase()">{{ statusLabel(usage.status) }}</span>
            <span class="cycle-note" *ngIf="usage.planName !== 'Free'">· {{ usage.billingCycle === 'Yearly' ? 'Anual' : 'Mensal' }}</span>
          </div>
          <button class="btn-secondary" *ngIf="usage.planName !== 'Free'" (click)="manageSubscription()">Gerir subscrição</button>
        </div>

        <p class="renewal-note" *ngIf="usage.currentPeriodEnd">
          {{ usage.cancelAtPeriodEnd ? 'Termina' : 'Renova' }} a {{ usage.currentPeriodEnd | date:'dd/MM/yyyy' }}
        </p>

        <div class="usage-grid" *ngIf="usage.items.length > 0">
          <div class="usage-item" *ngFor="let item of usage.items">
            <div class="usage-item-label">
              <span>{{ item.description || item.feature }}</span>
              <span class="usage-count">{{ item.isUnlimited ? 'Ilimitado' : (item.currentUsage + ' / ' + item.limitValue) }}</span>
            </div>
            <div class="usage-bar" *ngIf="!item.isUnlimited">
              <div class="usage-bar-fill" [class.usage-bar-full]="usagePercent(item) >= 100" [style.width.%]="usagePercent(item)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing cycle toggle -->
      <div class="cycle-toggle">
        <button class="toggle-btn" [class.active]="cycle === 'Monthly'" (click)="cycle = 'Monthly'">Mensal</button>
        <button class="toggle-btn" [class.active]="cycle === 'Yearly'" (click)="cycle = 'Yearly'">Anual <span class="save-badge">poupa 2 meses</span></button>
      </div>

      <!-- Plan comparison -->
      <div class="plans-grid">
        <div class="plan-card card" *ngFor="let plan of plans" [class.current]="isCurrentPlan(plan)">
          <h3>{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="price-value">{{ priceFor(plan) | number:'1.0-2' }} €</span>
            <span class="price-period">/{{ cycle === 'Yearly' ? 'ano' : 'mês' }}</span>
          </div>
          <ul class="plan-limits">
            <li *ngFor="let limit of plan.limits">{{ limit.description || (limit.feature + ': ' + limit.limitValue) }}</li>
          </ul>
          <button
            class="btn-primary"
            *ngIf="!isCurrentPlan(plan) && plan.price > 0"
            [disabled]="redirecting"
            (click)="subscribe(plan)">
            {{ redirecting ? 'A abrir checkout...' : 'Assinar' }}
          </button>
          <button class="btn-current" *ngIf="isCurrentPlan(plan)" disabled>Plano atual</button>
          <span class="free-note" *ngIf="!isCurrentPlan(plan) && plan.price === 0">Plano inicial gratuito</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .billing-page { max-width: 960px; margin: 0 auto; padding: 1rem; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .page-header { margin-bottom: 1rem; }
    .page-header h2 { margin: 0; font-size: 1.25rem; color: #1c1e21; }

    .banner { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.75rem; }
    .banner-success { background: #e6f7ec; color: #1e7e42; }
    .banner-cancel { background: #fef3e0; color: #a86400; }
    .btn-link { background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; font-size: 0.85rem; padding: 0; }

    .usage-card { padding: 1.25rem; margin-bottom: 1.25rem; }
    .usage-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .usage-header h3 { margin: 0 0 0.35rem; font-size: 1.05rem; color: #1c1e21; }
    .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; background: #e7f3ff; color: #1877f2; }
    .status-active { background: #e6f7ec; color: #1e7e42; }
    .status-pastdue { background: #fef3e0; color: #a86400; }
    .status-cancelled { background: #fce4e4; color: #e74c3c; }
    .cycle-note { font-size: 0.8rem; color: #65676b; margin-left: 0.35rem; }
    .renewal-note { font-size: 0.8rem; color: #65676b; margin: 0.5rem 0 0; }

    .usage-grid { margin-top: 1rem; display: grid; gap: 0.85rem; }
    .usage-item-label { display: flex; justify-content: space-between; font-size: 0.85rem; color: #1c1e21; margin-bottom: 0.3rem; }
    .usage-count { color: #65676b; }
    .usage-bar { height: 6px; background: #f0f2f5; border-radius: 3px; overflow: hidden; }
    .usage-bar-fill { height: 100%; background: #1877f2; border-radius: 3px; transition: width 0.2s; }
    .usage-bar-full { background: #e74c3c; }

    .cycle-toggle { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .toggle-btn { padding: 0.5rem 1.25rem; border: 1px solid #dddfe2; background: white; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; color: #65676b; display: flex; align-items: center; gap: 0.4rem; }
    .toggle-btn.active { background: #1877f2; color: white; border-color: #1877f2; }
    .save-badge { font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.25); padding: 0.1rem 0.4rem; border-radius: 8px; }
    .toggle-btn:not(.active) .save-badge { background: #e6f7ec; color: #1e7e42; }

    .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .plan-card { padding: 1.5rem; text-align: center; border: 2px solid transparent; }
    .plan-card.current { border-color: #1877f2; }
    .plan-card h3 { margin: 0 0 0.75rem; font-size: 1.1rem; color: #1c1e21; }
    .plan-price { margin-bottom: 1rem; }
    .price-value { font-size: 1.75rem; font-weight: 700; color: #1877f2; }
    .price-period { font-size: 0.85rem; color: #65676b; }
    .plan-limits { list-style: none; padding: 0; margin: 0 0 1.25rem; text-align: left; }
    .plan-limits li { font-size: 0.8rem; color: #65676b; padding: 0.25rem 0; border-bottom: 1px solid #f0f2f5; }
    .plan-limits li:last-child { border-bottom: none; }

    .btn-primary { width: 100%; padding: 0.6rem; background: #1877f2; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-primary:hover { background: #166fe5; }
    .btn-primary:disabled { background: #a0c3ff; cursor: not-allowed; }
    .btn-current { width: 100%; padding: 0.6rem; background: #e7f3ff; color: #1877f2; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: default; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 8px; font-size: 0.85rem; cursor: pointer; white-space: nowrap; }
    .btn-secondary:hover { background: #d8dadf; }
    .free-note { font-size: 0.8rem; color: #65676b; }

    @media (max-width: 600px) { .plans-grid { grid-template-columns: 1fr; } }
  `]
})
export class BillingComponent implements OnInit {
  plans: Plan[] = [];
  usage: PlanUsage | null = null;
  cycle: BillingCycle = 'Monthly';
  redirecting = false;
  checkoutBanner: 'success' | 'cancel' | null = null;

  constructor(private billingService: BillingService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadUsage();
    const checkout = this.route.snapshot.queryParamMap.get('checkout');
    if (checkout === 'success' || checkout === 'cancel') this.checkoutBanner = checkout;
  }

  loadPlans(): void {
    this.billingService.getPlans().subscribe(r => {
      if (r.success && r.data) this.plans = r.data;
    });
  }

  loadUsage(): void {
    this.billingService.getUsage().subscribe(r => {
      if (r.success && r.data) this.usage = r.data;
    });
  }

  refreshUsage(): void {
    this.loadUsage();
  }

  isCurrentPlan(plan: Plan): boolean {
    return this.usage?.planId === plan.id;
  }

  priceFor(plan: Plan): number {
    return this.cycle === 'Yearly' ? (plan.priceYearly ?? plan.price * 12) : plan.price;
  }

  subscribe(plan: Plan): void {
    this.redirecting = true;
    this.billingService.createCheckoutSession({ planId: plan.id, billingCycle: this.cycle }).subscribe({
      next: (r) => {
        if (r.success && r.data) {
          window.location.href = r.data.checkoutUrl;
        } else {
          this.redirecting = false;
          alert(r.message || 'Não foi possível iniciar o checkout');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.redirecting = false;
        alert(err.error?.message || 'Não foi possível iniciar o checkout');
      }
    });
  }

  manageSubscription(): void {
    this.billingService.createPortalSession().subscribe({
      next: (r) => {
        if (r.success && r.data) window.location.href = r.data.portalUrl;
        else alert(r.message || 'Não foi possível abrir o portal de faturação');
      },
      error: (err: HttpErrorResponse) => alert(err.error?.message || 'Não foi possível abrir o portal de faturação')
    });
  }

  usagePercent(item: PlanUsageItem): number {
    if (item.isUnlimited || item.limitValue <= 0) return 0;
    return Math.min(100, Math.round((item.currentUsage / item.limitValue) * 100));
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { Active: 'Ativo', PastDue: 'Pagamento pendente', Cancelled: 'Cancelado', Trial: 'Período de teste' };
    return map[status] || status;
  }
}
