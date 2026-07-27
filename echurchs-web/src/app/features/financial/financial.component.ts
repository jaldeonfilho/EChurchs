import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FinancialService } from '../../core/services/financial.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';
import { MembershipResponse } from '../../core/models/community.model';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="financial-page">
      <div class="page-header card">
        <h2>Financeiro</h2>
        <button class="btn-primary" *ngIf="isAdminOrFinancial" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Novo Registo' }}</button>
      </div>

      <!-- Tabs: Admin or FinancialManager -->
      <div class="tabs card" *ngIf="isAdminOrFinancial">
        <button [class.active]="activeTab === 'entradas'" (click)="activeTab = 'entradas'; showForm = false">📥 Entradas</button>
        <button [class.active]="activeTab === 'saidas'" (click)="activeTab = 'saidas'; showForm = false">📤 Saídas</button>
        <button [class.active]="activeTab === 'balanco'" (click)="activeTab = 'balanco'; showForm = false">📊 Balanço Geral</button>
      </div>

      <!-- Regular members: only see donations tab -->
      <div class="tabs card" *ngIf="!isAdminOrFinancial">
        <button class="active">🙏 Minhas Doações</button>
      </div>

      <!-- ========== ADMIN/FINANCIAL: ENTRADAS ========== -->
      <ng-container *ngIf="isAdminOrFinancial && activeTab === 'entradas' && !showForm">
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês Referência</label>
              <select [(ngModel)]="filterReferenceMonth" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano Referência</label>
              <select [(ngModel)]="filterReferenceYear" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Membro</label>
              <select [(ngModel)]="filterMemberId" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of members" [value]="m.userId">{{ m.userName }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Categoria</label>
              <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilters()">
                <option value="">Todas</option>
                <option value="Tithe">Dízimo</option>
                <option value="Offering">Oferta</option>
                <option value="Donation">Doação</option>
              </select>
            </div>
          </div>
        </div>

        <div class="summary-row">
          <div class="summary-card card income">
            <span class="summary-label">Total Dízimos</span>
            <span class="summary-value">{{ totalTithes | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card offering">
            <span class="summary-label">Total Ofertas</span>
            <span class="summary-value">{{ totalOfferings | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card balance">
            <span class="summary-label">Total Entradas</span>
            <span class="summary-value">{{ totalEntradas | number:'1.2-2' }} EUR</span>
          </div>
        </div>

        <div class="transaction-list">
          <div class="transaction-item card" *ngFor="let t of filteredEntradas">
            <div class="tx-icon tx-income">{{ getTxEmoji(t) }}</div>
            <div class="tx-info">
              <strong>{{ getTxLabel(t) }}</strong>
              <span class="tx-desc">{{ t.description || 'Sem descrição' }}</span>
              <div class="tx-meta">
                <span class="tx-cat" *ngIf="t.userName">{{ t.userName }}</span>
                <span class="tx-cat" *ngIf="getReferenceLabel(t)">Ref: {{ getReferenceLabel(t) }}</span>
                <span class="tx-date">{{ t.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="tx-right">
              <div class="tx-amount amount-income">+{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
              <div class="tx-actions">
                <button class="btn-icon" (click)="edit(t)">✏️</button>
                <button class="btn-icon btn-danger" (click)="deleteTransaction(t.id)">🗑️</button>
              </div>
            </div>
          </div>
          <div class="empty-state card" *ngIf="filteredEntradas.length === 0">
            <span class="empty-icon">📥</span>
            <p>Nenhuma entrada registada para este período</p>
          </div>
        </div>
      </ng-container>

      <!-- ========== ADMIN/FINANCIAL: SAÍDAS ========== -->
      <ng-container *ngIf="isAdminOrFinancial && activeTab === 'saidas' && !showForm">
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês Referência</label>
              <select [(ngModel)]="filterReferenceMonth" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano Referência</label>
              <select [(ngModel)]="filterReferenceYear" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Membro</label>
              <select [(ngModel)]="filterMemberId" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of members" [value]="m.userId">{{ m.userName }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Estado</label>
              <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
                <option value="">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>
        </div>

        <div class="summary-row summary-4">
          <div class="summary-card card expense">
            <span class="summary-label">Total Pago</span>
            <span class="summary-value">{{ totalPaid | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card pending">
            <span class="summary-label">Total Pendente</span>
            <span class="summary-value">{{ totalPending | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card overdue">
            <span class="summary-label">Total Vencido</span>
            <span class="summary-value">{{ totalOverdue | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card total-expense">
            <span class="summary-label">Total Saídas</span>
            <span class="summary-value">{{ totalSaidas | number:'1.2-2' }} EUR</span>
          </div>
        </div>

        <div class="transaction-list">
          <div class="transaction-item card" *ngFor="let t of filteredSaidas">
            <div class="tx-icon tx-expense">💸</div>
            <div class="tx-info">
              <strong>{{ t.description || t.name || 'Sem descrição' }}</strong>
              <span class="tx-desc">{{ t.expenseCategory || t.metadata?.['expenseCategory'] || 'Sem categoria' }}</span>
              <div class="tx-meta">
                <span class="tx-cat" *ngIf="t.userName">{{ t.userName }}</span>
                <span class="tx-cat" *ngIf="getReferenceLabel(t)">Ref: {{ getReferenceLabel(t) }}</span>
                <span class="tx-date">{{ t.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="tx-right">
              <span class="status-badge" [class]="getStatusClass(t)">{{ getStatusLabel(t) }}</span>
              <div class="tx-amount amount-expense">-{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
              <div class="tx-actions">
                <button class="btn-icon" (click)="edit(t)">✏️</button>
                <button class="btn-icon btn-danger" (click)="deleteTransaction(t.id)">🗑️</button>
              </div>
            </div>
          </div>
          <div class="empty-state card" *ngIf="filteredSaidas.length === 0">
            <span class="empty-icon">📤</span>
            <p>Nenhuma despesa registada para este período</p>
          </div>
        </div>
      </ng-container>

      <!-- ========== ADMIN/FINANCIAL: BALANÇO ========== -->
      <ng-container *ngIf="isAdminOrFinancial && activeTab === 'balanco'">
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês Referência</label>
              <select [(ngModel)]="filterReferenceMonth" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano Referência</label>
              <select [(ngModel)]="filterReferenceYear" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="summary-row summary-3">
          <div class="summary-card card income">
            <span class="summary-label">Total Receitas</span>
            <span class="summary-value">{{ balancoReceitas | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card expense">
            <span class="summary-label">Total Despesas</span>
            <span class="summary-value">{{ balancoDespesas | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card balance" [class.positive]="balancoMes >= 0" [class.negative]="balancoMes < 0">
            <span class="summary-label">Saldo do Mês</span>
            <span class="summary-value">{{ balancoMes | number:'1.2-2' }} EUR</span>
          </div>
        </div>

        <div class="summary-row summary-2">
          <div class="summary-card card previous">
            <span class="summary-label">Saldo Anterior</span>
            <span class="summary-value">{{ saldoAnterior | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card total-balance" [class.positive]="saldoTotal >= 0" [class.negative]="saldoTotal < 0">
            <span class="summary-label">Saldo Total</span>
            <span class="summary-value">{{ saldoTotal | number:'1.2-2' }} EUR</span>
          </div>
        </div>

        <div class="balance-table card">
          <div class="table-header">
            <span class="col-hist">Histórico</span>
            <span class="col-ent">Entradas</span>
            <span class="col-sai">Saídas</span>
          </div>
          <div class="table-row" *ngFor="let row of balancoRows">
            <span class="col-hist">{{ row.description }}</span>
            <span class="col-ent" [class.has-value]="row.income > 0">{{ row.income > 0 ? (row.income | number:'1.2-2') + ' EUR' : '-' }}</span>
            <span class="col-sai" [class.has-value]="row.expense > 0">{{ row.expense > 0 ? (row.expense | number:'1.2-2') + ' EUR' : '-' }}</span>
          </div>
          <div class="table-footer">
            <span class="col-hist"><strong>Total</strong></span>
            <span class="col-ent"><strong>{{ balancoReceitas | number:'1.2-2' }} EUR</strong></span>
            <span class="col-sai"><strong>{{ balancoDespesas | number:'1.2-2' }} EUR</strong></span>
          </div>
          <div class="empty-state" *ngIf="balancoRows.length === 0">
            <p>Sem dados para este período</p>
          </div>
        </div>
      </ng-container>

      <!-- ========== ALL MEMBERS: MINHAS DOAÇÕES ========== -->
      <ng-container *ngIf="!isAdminOrFinancial">
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês Referência</label>
              <select [(ngModel)]="filterReferenceMonth" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano Referência</label>
              <select [(ngModel)]="filterReferenceYear" (ngModelChange)="applyFilters()">
                <option [value]="null">Todos</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Tipo</label>
              <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilters()">
                <option value="">Todos</option>
                <option value="Tithe">Dízimo</option>
                <option value="Offering">Oferta</option>
                <option value="Donation">Doação</option>
              </select>
            </div>
          </div>
        </div>

        <div class="summary-row">
          <div class="summary-card card income">
            <span class="summary-label">Total Dízimos</span>
            <span class="summary-value">{{ totalMyTithes | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card offering">
            <span class="summary-label">Total Ofertas</span>
            <span class="summary-value">{{ totalMyOfferings | number:'1.2-2' }} EUR</span>
          </div>
          <div class="summary-card card balance">
            <span class="summary-label">Total Doações</span>
            <span class="summary-value">{{ totalMyDonations | number:'1.2-2' }} EUR</span>
          </div>
        </div>

        <div class="transaction-list">
          <div class="transaction-item card" *ngFor="let t of filteredMyTx">
            <div class="tx-icon tx-income">{{ getTxEmoji(t) }}</div>
            <div class="tx-info">
              <strong>{{ getTxLabel(t) }}</strong>
              <span class="tx-desc">{{ t.description || 'Sem descrição' }}</span>
              <div class="tx-meta">
                <span class="tx-cat" *ngIf="getReferenceLabel(t)">Ref: {{ getReferenceLabel(t) }}</span>
                <span class="tx-date">{{ t.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="tx-right">
              <div class="tx-amount amount-income">+{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
            </div>
          </div>
          <div class="empty-state card" *ngIf="filteredMyTx.length === 0">
            <span class="empty-icon">🙏</span>
            <p>Nenhuma doação registada para este período</p>
          </div>
        </div>
      </ng-container>

      <!-- ========== FORM (shared) ========== -->
      <div class="form-card card" *ngIf="showForm">
        <h3>{{ editingId ? 'Editar Registo' : (activeTab === 'saidas' ? 'Nova Despesa' : 'Novo Registo de Entrada') }}</h3>
        <form (ngSubmit)="onSubmit()">
<div class="form-row">
            <div class="form-group">
              <label>Tipo *</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="entryType" value="Tithe" [(ngModel)]="entryType"> Dízimo
                </label>
                <label class="radio-label">
                  <input type="radio" name="entryType" value="Offering" [(ngModel)]="entryType"> Oferta
                </label>
                <label class="radio-label">
                  <input type="radio" name="entryType" value="Donation" [(ngModel)]="entryType"> Doação
                </label>
              </div>
            </div>
            <div class="form-group" *ngIf="entryType === 'Tithe' && isAdminOrFinancial">
              <label>Membro *</label>
              <select [(ngModel)]="selectedMemberId" name="memberId" required>
                <option value="">Selecione o membro</option>
                <option *ngFor="let m of members" [value]="m.userId">{{ m.userName }}</option>
              </select>
            </div>
            </div>
            <div class="form-group">
              <label>Valor (EUR) *</label>
              <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" min="0" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data da Transacção *</label>
              <input type="date" [(ngModel)]="entryDate" name="entryDate" required>
            </div>
            <div class="form-group">
              <label>Mês/Ano Referência *</label>
              <div class="form-row-ref">
                <select [(ngModel)]="referenceMonth" name="refMonth" required>
                  <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
                </select>
                <select [(ngModel)]="referenceYear" name="refYear" required>
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
            </div>
          </div>

          <ng-container *ngIf="activeTab === 'entradas' || (!isAdminOrFinancial && activeTab === 'doacoes')">
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="description" name="description" placeholder="Ex: Dízimo mensal de julho">
            </div>
            <div class="form-group">
              <label>Forma de Pagamento</label>
              <select [(ngModel)]="paymentMethod" name="paymentMethod">
                <option value="">Não informado</option>
                <option value="Cash">Dinheiro</option>
                <option value="MBWay">MB Way</option>
                <option value="BankTransfer">Transferência Bancária</option>
                <option value="CreditCard">Cartão de Crédito</option>
                <option value="Multibanco">Referência Multibanco</option>
              </select>
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab === 'saidas'">
            <div class="form-group">
              <label>Descrição *</label>
              <input type="text" [(ngModel)]="formData.description" name="description" placeholder="Ex: Conta de luz" required>
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select [(ngModel)]="expenseCategory" name="expenseCategory" required>
                <option value="">Selecione...</option>
                <option value="Serviços">Serviços</option>
                <option value="Papelaria">Papelaria</option>
                <option value="Higiene">Higiene</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Eventos">Eventos</option>
                <option value="Materiais">Materiais</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data de Vencimento</label>
                <input type="date" [(ngModel)]="dueDate" name="dueDate">
              </div>
              <div class="form-group">
                <label>Pago?</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="paidStatus" value="S" [(ngModel)]="paidStatus"> Sim
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="paidStatus" value="N" [(ngModel)]="paidStatus"> Não
                  </label>
                </div>
              </div>
            </div>
          </ng-container>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Salvar</button>
            <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .financial-page { max-width: 800px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .tabs { display: flex; padding: 0; overflow-x: auto; }
    .tabs button { flex: 1; padding: 0.7rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #65676b; font-weight: 500; transition: all 0.2s; border-bottom: 3px solid transparent; white-space: nowrap; }
    .tabs button.active { background: #e7f3ff; color: #1877f2; font-weight: 600; border-bottom-color: #1877f2; }
    .tabs button:hover { background: #f0f2f5; }
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }
    .filters { padding: 0.75rem 1.25rem; }
    .filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 140px; }
    .filter-group label { font-size: 0.75rem; color: #65676b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .filter-group select { padding: 0.45rem 0.6rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.85rem; outline: none; background: white; }
    .filter-group select:focus { border-color: #1877f2; }
    .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem; }
    .summary-row.summary-4 { grid-template-columns: repeat(4, 1fr); }
    .summary-row.summary-2 { grid-template-columns: repeat(2, 1fr); }
    .summary-row.summary-3 { grid-template-columns: repeat(3, 1fr); }
    .summary-card { display: flex; flex-direction: column; align-items: center; padding: 0.85rem; }
    .summary-label { font-size: 0.75rem; color: #65676b; margin-bottom: 0.2rem; font-weight: 500; }
    .summary-value { font-size: 1.1rem; font-weight: 700; }
    .income .summary-value { color: #27ae60; }
    .offering .summary-value { color: #2ecc71; }
    .expense .summary-value { color: #e74c3c; }
    .total-expense .summary-value { color: #c0392b; }
    .pending .summary-value { color: #f39c12; }
    .overdue .summary-value { color: #e74c3c; }
    .balance .summary-value { color: #1877f2; }
    .previous .summary-value { color: #7f8c8d; }
    .total-balance .summary-value { color: #2c3e50; font-size: 1.2rem; }
    .positive .summary-value { color: #27ae60 !important; }
    .negative .summary-value { color: #e74c3c !important; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-row-ref { display: flex; gap: 0.5rem; }
    .form-row-ref select { flex: 1; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input, .form-group select { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .radio-group { display: flex; gap: 1rem; padding-top: 0.3rem; flex-wrap: wrap; }
    .radio-label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; cursor: pointer; }
    .radio-label input[type="radio"] { width: auto; }
    .transaction-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .tx-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .tx-income { background: #d4edda; }
    .tx-expense { background: #fce4e4; }
    .tx-info { flex: 1; }
    .tx-info strong { font-size: 0.95rem; display: block; }
    .tx-desc { font-size: 0.8rem; color: #65676b; display: block; }
    .tx-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem; flex-wrap: wrap; }
    .tx-cat { font-size: 0.7rem; color: #1877f2; background: #e7f3ff; padding: 0.1rem 0.4rem; border-radius: 8px; }
    .tx-date { font-size: 0.75rem; color: #65676b; }
    .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
    .tx-amount { font-weight: 700; font-size: 0.95rem; }
    .amount-income { color: #27ae60; }
    .amount-expense { color: #e74c3c; }
    .tx-actions { display: flex; gap: 0.25rem; }
    .status-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 10px; text-transform: uppercase; }
    .status-paid { background: #d4edda; color: #27ae60; }
    .status-pending { background: #fef9e7; color: #f39c12; }
    .status-overdue { background: #fce4e4; color: #e74c3c; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .balance-table { overflow: hidden; }
    .table-header, .table-row, .table-footer { display: flex; padding: 0.6rem 1.25rem; border-bottom: 1px solid #f0f2f5; }
    .table-header { background: #f8f9fa; font-weight: 600; font-size: 0.85rem; color: #65676b; }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #f8f9fa; }
    .table-footer { background: #f0f2f5; font-size: 0.9rem; }
    .col-hist { flex: 2; }
    .col-ent, .col-sai { flex: 1; text-align: right; }
    .has-value { color: #1c1e21; }
    @media (max-width: 700px) {
      .summary-row, .summary-row.summary-4, .summary-row.summary-3 { grid-template-columns: 1fr 1fr; }
      .filter-row { flex-direction: column; }
      .filter-group { min-width: 100%; }
      .form-row { grid-template-columns: 1fr; }
      .form-row-ref { flex-direction: column; }
    }
  `]
})
export class FinancialComponent implements OnInit {
  activeTab: 'entradas' | 'saidas' | 'balanco' | 'doacoes' = 'entradas';
  showForm = false;
  editingId: string | null = null;

  allTransactions: GenericModuleItem[] = [];
  filteredEntradas: GenericModuleItem[] = [];
  filteredSaidas: GenericModuleItem[] = [];
  filteredMyTx: GenericModuleItem[] = [];
  categories: GenericModuleItem[] = [];
  members: MembershipResponse[] = [];

  isAdminOrFinancial = false;

  filterReferenceMonth: string | null = null;
  filterReferenceYear: string | null = null;
  filterMemberId: string | null = null;
  filterCategory = '';
  filterStatus = '';

formData: GenericModuleRequest = { amount: 0, description: '', name: '' };
  entryType = 'Tithe';
  entryDate = '';
  referenceMonth = '';
  referenceYear = '';
  paymentMethod = '';
  expenseCategory = '';
  dueDate = '';
  paidStatus = 'S';
  selectedMemberId = '';
  description = '';

  totalTithes = 0;
  totalOfferings = 0;
  totalEntradas = 0;
  totalMyTithes = 0;
  totalMyOfferings = 0;
  totalMyDonations = 0;

  totalPaid = 0;
  totalPending = 0;
  totalOverdue = 0;
  totalSaidas = 0;

  balancoReceitas = 0;
  balancoDespesas = 0;
  balancoMes = 0;
  saldoAnterior = 0;
  saldoTotal = 0;
  balancoRows: { description: string; income: number; expense: number }[] = [];

  months = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];
  years: string[] = [];

  private txLabels: Record<string, string> = { Tithe: 'Dízimo', Offering: 'Oferta', Expense: 'Despesa', Donation: 'Doação', Other: 'Outro' };
  private txEmojis: Record<string, string> = { Tithe: '🙏', Offering: '💝', Expense: '💸', Donation: '🎁', Other: '📝' };

  constructor(private authService: AuthService, private financialService: FinancialService) {
    const now = new Date();
    this.filterReferenceMonth = null;
    this.filterReferenceYear = null;
    const currentYear = now.getFullYear();
    this.years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
    this.referenceMonth = (now.getMonth() + 1).toString();
    this.referenceYear = now.getFullYear().toString();
  }

  ngOnInit(): void {
    this.entryDate = new Date().toISOString().split('T')[0];
    this.isAdminOrFinancial = this.authService.isAdmin || this.authService.isFinancialManager;

    if (this.isAdminOrFinancial) {
      this.activeTab = 'entradas';
      this.loadData();
      this.loadCategories();
      this.loadMembers();
    } else {
      this.activeTab = 'doacoes';
      this.loadPersonalDonations();
    }
  }

  loadData(): void {
    this.financialService.getTransactions(
      this.filterReferenceMonth ? parseInt(this.filterReferenceMonth, 10) : undefined,
      this.filterReferenceYear ? parseInt(this.filterReferenceYear, 10) : undefined,
      this.filterMemberId ?? undefined
    ).subscribe(r => {
      if (r.success && r.data) {
        this.allTransactions = r.data;
        this.applyFilters();
      }
    });
  }

  loadPersonalDonations(): void {
    this.financialService.getPersonalDonations().subscribe(r => {
      if (r.success && r.data) {
        this.allTransactions = r.data;
        this.applyFilters();
      }
    });
  }

  loadCategories(): void {
    this.financialService.getCategories().subscribe(r => { if (r.success && r.data) this.categories = r.data; });
  }

  loadMembers(): void {
    this.financialService.getMembersList().subscribe(r => {
      if (r.success && r.data) this.members = r.data;
    });
  }

  applyFilters(): void {
    const month = this.filterReferenceMonth !== null ? parseInt(this.filterReferenceMonth, 10) : undefined;
    const year = this.filterReferenceYear !== null ? parseInt(this.filterReferenceYear, 10) : undefined;

    let monthTx = this.allTransactions.filter(t => {
      const mMatch = month === undefined || t.referenceMonth === month;
      const yMatch = year === undefined || t.referenceYear === year;
      return mMatch && yMatch;
    });

    if (this.isAdminOrFinancial) {
      this.applyAdminFilters(monthTx, month, year);
    } else {
      this.applyMemberFilters(monthTx);
    }
  }

  private applyAdminFilters(monthTx: GenericModuleItem[], month: number | undefined, year: number | undefined): void {
    let entradas = monthTx.filter(t => this.getTxType(t) !== 'expense');
    if (this.filterCategory) {
      entradas = entradas.filter(t => t.name === this.filterCategory || t.metadata?.['type'] === this.filterCategory);
    }
    this.filteredEntradas = entradas;
    this.totalTithes = entradas.filter(t => t.name === 'Tithe').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalOfferings = entradas.filter(t => t.name === 'Offering').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalEntradas = entradas.reduce((s, t) => s + (t.amount ?? 0), 0);

    let saidas = monthTx.filter(t => this.getTxType(t) === 'expense');
    if (this.filterStatus) {
      saidas = saidas.filter(t => this.getRawStatus(t) === this.filterStatus);
    }
    this.filteredSaidas = saidas;
    this.totalPaid = saidas.filter(t => this.getRawStatus(t) === 'paid').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalPending = saidas.filter(t => this.getRawStatus(t) === 'pending').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalOverdue = saidas.filter(t => this.getRawStatus(t) === 'overdue').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalSaidas = saidas.reduce((s, t) => s + (t.amount ?? 0), 0);

    this.balancoReceitas = entradas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balancoDespesas = saidas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balancoMes = this.balancoReceitas - this.balancoDespesas;

    const beforeTx = this.allTransactions.filter(t => {
      const tMonth = t.referenceMonth;
      const tYear = t.referenceYear;
      if (year !== undefined && tYear !== undefined && tYear < year) return true;
      if (year !== undefined && tYear !== undefined && tYear > year) return false;
       if (year !== undefined && tYear === year && tMonth !== undefined && month !== undefined && tMonth < month) return true;
      return false;
    });
    const prevEntradas = beforeTx.filter(t => this.getTxType(t) !== 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    const prevSaidas = beforeTx.filter(t => this.getTxType(t) === 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.saldoAnterior = prevEntradas - prevSaidas;
    this.saldoTotal = this.saldoAnterior + this.balancoMes;

    const categoryMap = new Map<string, { income: number; expense: number }>();
    entradas.forEach(t => {
      const cat = t.metadata?.['categoryName'] || this.txLabels[t.name ?? ''] || 'Outros';
      const existing = categoryMap.get(cat) || { income: 0, expense: 0 };
      existing.income += t.amount ?? 0;
      categoryMap.set(cat, existing);
    });
    saidas.forEach(t => {
      const cat = t.expenseCategory || t.metadata?.['expenseCategory'] || t.description || 'Despesas';
      const existing = categoryMap.get(cat) || { income: 0, expense: 0 };
      existing.expense += t.amount ?? 0;
      categoryMap.set(cat, existing);
    });
    this.balancoRows = Array.from(categoryMap.entries()).map(([description, data]) => ({ description, ...data }));
  }

  private applyMemberFilters(monthTx: GenericModuleItem[]): void {
    this.filteredMyTx = monthTx;
    this.totalMyTithes = monthTx.filter(t => t.name === 'Tithe').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalMyOfferings = monthTx.filter(t => t.name === 'Offering').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalMyDonations = monthTx.filter(t => t.name === 'Donation').reduce((s, t) => s + (t.amount ?? 0), 0);
  }

  onSubmit(): void {
    const meta: Record<string, string> = { type: this.entryType };
    if (this.paymentMethod) meta['paymentMethod'] = this.paymentMethod;
    if (this.paidStatus) meta['paidStatus'] = this.paidStatus;
    if (this.expenseCategory) meta['expenseCategory'] = this.expenseCategory;
    if (this.entryType === 'Tithe' && this.selectedMemberId) meta['memberId'] = this.selectedMemberId;

    const isExpense = this.activeTab === 'saidas';
    const req: GenericModuleRequest = {
      name: isExpense ? 'Expense' : (this.isAdminOrFinancial ? this.entryType : 'Tithe'),
      amount: this.formData.amount,
      description: this.description || (this.entryType === 'Tithe' ? 'Dízimo' : this.entryType === 'Offering' ? 'Oferta' : 'Doação'),
      startDate: this.entryDate,
      referenceMonth: parseInt(this.referenceMonth, 10),
      referenceYear: parseInt(this.referenceYear, 10),
      dueDate: this.dueDate || undefined,
      expenseCategory: this.expenseCategory,
      metadata: meta
    };

    if (this.editingId) {
      this.financialService.updateTransaction(this.editingId, req).subscribe(() => { this.loadData(); this.cancelEdit(); });
    } else {
      this.financialService.createTransaction(req).subscribe(() => { this.loadData(); this.cancelEdit(); });
    }
  }

  edit(t: GenericModuleItem): void {
    this.editingId = t.id;
    const isExpense = this.getTxType(t) === 'expense';
    if (isExpense) {
      this.activeTab = 'saidas';
      this.formData = { amount: t.amount ?? 0, description: t.description ?? '', name: 'Expense', expenseCategory: t.expenseCategory ?? t.metadata?.['expenseCategory'] ?? '' };
      this.paidStatus = t.metadata?.['paidStatus'] ?? 'S';
      this.dueDate = t.dueDate ?? t.metadata?.['dueDate'] ?? '';
    } else {
      this.activeTab = 'entradas';
      this.formData = { amount: t.amount ?? 0, description: t.description ?? '', name: t.name ?? 'Tithe' };
      this.description = t.description ?? '';
      this.entryType = t.name ?? 'Tithe';
      this.paymentMethod = t.metadata?.['paymentMethod'] ?? '';
      this.selectedMemberId = t.userId ?? t.metadata?.['userId'] ?? '';
    }
    this.entryDate = t.startDate ? t.startDate.split('T')[0] : t.createdAt.split('T')[0];
    this.referenceMonth = t.referenceMonth?.toString() ?? '';
    this.referenceYear = t.referenceYear?.toString() ?? '';
    this.showForm = true;
  }

  deleteTransaction(id: string): void {
    if (confirm('Tem certeza que deseja eliminar este registo?')) {
      this.financialService.deleteTransaction(id).subscribe(() => this.loadData());
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { amount: 0, description: '', name: '' };
    this.description = '';
    this.selectedMemberId = '';
    this.entryType = 'Tithe';
    this.entryDate = new Date().toISOString().split('T')[0];
    this.referenceMonth = (new Date().getMonth() + 1).toString();
    this.referenceYear = new Date().getFullYear().toString();
    this.paymentMethod = '';
    this.expenseCategory = '';
    this.dueDate = '';
    this.paidStatus = 'S';
  }

  getTxType(t: GenericModuleItem): string {
    const type = t.metadata?.['type'] || t.name;
    return type === 'Expense' ? 'expense' : 'income';
  }

  getTxLabel(t: GenericModuleItem): string {
    return this.txLabels[(t.name ?? '')] || (t.name ?? '');
  }

  getTxEmoji(t: GenericModuleItem): string {
    return this.txEmojis[t.name ?? ''] || '📝';
  }

  getPaymentLabel(t: GenericModuleItem): string {
    const pm = t.metadata?.['paymentMethod'];
    if (!pm) return '';
    const labels: Record<string, string> = { Cash: 'Dinheiro', MBWay: 'MB Way', BankTransfer: 'Transferência', CreditCard: 'Cartão', Multibanco: 'Multibanco' };
    return labels[pm] || pm;
  }

  getReferenceLabel(t: GenericModuleItem): string {
    const rm = t.referenceMonth ?? 0;
    const ry = t.referenceYear ?? 0;
    if (rm === 0 || ry === 0) return '';
    const m = this.months.find(m => m.value === rm.toString());
    return `${m?.label ?? rm}/${ry}`;
  }

  getRawStatus(t: GenericModuleItem): string {
    const paid = t.metadata?.['paidStatus'];
    if (paid === 'S') return 'paid';
    const dueDate = t.dueDate ?? t.metadata?.['dueDate'];
    if (dueDate) {
      const due = new Date(dueDate);
      if (due < new Date()) return 'overdue';
    }
    return 'pending';
  }

  getStatusLabel(t: GenericModuleItem): string {
    const s = this.getRawStatus(t);
    return s === 'paid' ? 'Pago' : s === 'overdue' ? 'Vencido' : 'Pendente';
  }

  getStatusClass(t: GenericModuleItem): string {
    const s = this.getRawStatus(t);
    return s === 'paid' ? 'status-paid' : s === 'overdue' ? 'status-overdue' : 'status-pending';
  }
}
