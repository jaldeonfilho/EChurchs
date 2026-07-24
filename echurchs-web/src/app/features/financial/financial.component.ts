import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FinancialService } from '../../core/services/financial.service';
import { GenericModuleItem, GenericModuleRequest } from '../../core/models/module.model';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="financial-page">
      <div class="page-header card">
        <h2>Financeiro</h2>
        <button class="btn-primary" (click)="showForm = !showForm">{{ showForm ? 'Cancelar' : '+ Novo Registo' }}</button>
      </div>

      <!-- Tabs -->
      <div class="tabs card">
        <button [class.active]="activeTab === 'entradas'" (click)="activeTab = 'entradas'">📥 Entradas</button>
        <button [class.active]="activeTab === 'saidas'" (click)="activeTab = 'saidas'">📤 Saídas</button>
        <button [class.active]="activeTab === 'balanco'" (click)="activeTab = 'balanco'">📊 Balanço Geral</button>
      </div>

      <!-- Form (shared for Entradas and Saídas) -->
      <div class="form-card card" *ngIf="showForm && activeTab !== 'balanco'">
        <h3>{{ editingId ? 'Editar Registo' : (activeTab === 'entradas' ? 'Novo Registo de Entrada' : 'Nova Despesa') }}</h3>
        <form (ngSubmit)="onSubmit()">

          <!-- Entradas form -->
          <ng-container *ngIf="activeTab === 'entradas'">
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
              <div class="form-group">
                <label>Valor (EUR) *</label>
                <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" min="0" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data *</label>
                <input type="date" [(ngModel)]="entryDate" name="entryDate" required>
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
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="formData.description" name="description" placeholder="Ex: Dízimo mensal de julho">
            </div>
          </ng-container>

          <!-- Saídas form -->
          <ng-container *ngIf="activeTab === 'saidas'">
            <div class="form-row">
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
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data de Lançamento *</label>
                <input type="date" [(ngModel)]="entryDate" name="entryDate" required>
              </div>
              <div class="form-group">
                <label>Data de Vencimento</label>
                <input type="date" [(ngModel)]="dueDate" name="dueDate">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Valor (EUR) *</label>
                <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" min="0" required>
              </div>
              <div class="form-group">
                <label>Estado</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="paidStatus" value="S" [(ngModel)]="paidStatus"> Pago
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="paidStatus" value="N" [(ngModel)]="paidStatus"> Pendente
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

      <!-- ==================== ABA ENTRADAS ==================== -->
      <ng-container *ngIf="activeTab === 'entradas' && !showForm">
        <!-- Filters -->
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês</label>
              <select [(ngModel)]="filterMonth" (ngModelChange)="applyFilters()">
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano</label>
              <select [(ngModel)]="filterYear" (ngModelChange)="applyFilters()">
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Categoria</label>
              <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilters()">
                <option value="">Todas</option>
                <option value="Tithe">Dízimo</option>
                <option value="Offering">Oferta</option>
                <option value="Donation">Doação</option>
                <option value="Other">Outro</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Totals -->
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

        <!-- Transaction List -->
        <div class="transaction-list">
          <div class="transaction-item card" *ngFor="let t of filteredEntradas">
            <div class="tx-icon tx-income">{{ getTxEmoji(t) }}</div>
            <div class="tx-info">
              <strong>{{ getTxLabel(t) }}</strong>
              <span class="tx-desc">{{ t.description || 'Sem descrição' }}</span>
              <div class="tx-meta">
                <span class="tx-cat" *ngIf="getPaymentLabel(t)">{{ getPaymentLabel(t) }}</span>
                <span class="tx-date">{{ t.createdAt | date:'dd/MM/yyyy' }}</span>
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

      <!-- ==================== ABA SAÍDAS ==================== -->
      <ng-container *ngIf="activeTab === 'saidas' && !showForm">
        <!-- Filters -->
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês</label>
              <select [(ngModel)]="filterMonth" (ngModelChange)="applyFilters()">
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano</label>
              <select [(ngModel)]="filterYear" (ngModelChange)="applyFilters()">
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
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

        <!-- Totals -->
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

        <!-- Expense List -->
        <div class="transaction-list">
          <div class="transaction-item card" *ngFor="let t of filteredSaidas">
            <div class="tx-icon tx-expense">💸</div>
            <div class="tx-info">
              <strong>{{ t.description || t.name || 'Sem descrição' }}</strong>
              <span class="tx-desc">{{ t.metadata?.['expenseCategory'] || 'Sem categoria' }}</span>
              <div class="tx-meta">
                <span class="tx-date">{{ t.createdAt | date:'dd/MM/yyyy' }}</span>
                <span class="tx-date" *ngIf="t.startDate"> · Vence: {{ t.startDate | date:'dd/MM/yyyy' }}</span>
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

      <!-- ==================== ABA BALANÇO GERAL ==================== -->
      <ng-container *ngIf="activeTab === 'balanco'">
        <!-- Filters -->
        <div class="filters card">
          <div class="filter-row">
            <div class="filter-group">
              <label>Mês</label>
              <select [(ngModel)]="filterMonth" (ngModelChange)="applyFilters()">
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano</label>
              <select [(ngModel)]="filterYear" (ngModelChange)="applyFilters()">
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Balance Summary -->
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

        <!-- Balance Table -->
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
    </div>
  `,
  styles: [`
    .financial-page { max-width: 800px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }

    /* Tabs */
    .tabs { display: flex; padding: 0; overflow: hidden; }
    .tabs button { flex: 1; padding: 0.7rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #65676b; font-weight: 500; transition: all 0.2s; border-bottom: 3px solid transparent; }
    .tabs button.active { background: #e7f3ff; color: #1877f2; font-weight: 600; border-bottom-color: #1877f2; }
    .tabs button:hover { background: #f0f2f5; }

    /* Buttons */
    .btn-primary { padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    .btn-secondary { padding: 0.5rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-left: 0.5rem; }

    /* Filters */
    .filters { padding: 0.75rem 1.25rem; }
    .filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 140px; }
    .filter-group label { font-size: 0.75rem; color: #65676b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .filter-group select { padding: 0.45rem 0.6rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.85rem; outline: none; background: white; }
    .filter-group select:focus { border-color: #1877f2; }

    /* Summary */
    .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem; }
    .summary-row.summary-4 { grid-template-columns: repeat(4, 1fr); }
    .summary-row.summary-2 { grid-template-columns: repeat(2, 1fr); }
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

    /* Form */
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 1rem; font-size: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.85rem; }
    .form-group input, .form-group select { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .radio-group { display: flex; gap: 1rem; padding-top: 0.3rem; }
    .radio-label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; cursor: pointer; }
    .radio-label input[type="radio"] { width: auto; }

    /* Transaction List */
    .transaction-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; }
    .tx-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .tx-income { background: #d4edda; }
    .tx-expense { background: #fce4e4; }
    .tx-info { flex: 1; }
    .tx-info strong { font-size: 0.95rem; display: block; }
    .tx-desc { font-size: 0.8rem; color: #65676b; display: block; }
    .tx-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem; }
    .tx-cat { font-size: 0.7rem; color: #1877f2; background: #e7f3ff; padding: 0.1rem 0.4rem; border-radius: 8px; }
    .tx-date { font-size: 0.75rem; color: #65676b; }
    .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
    .tx-amount { font-weight: 700; font-size: 0.95rem; }
    .amount-income { color: #27ae60; }
    .amount-expense { color: #e74c3c; }
    .tx-actions { display: flex; gap: 0.25rem; }

    /* Status Badge */
    .status-badge { font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 10px; text-transform: uppercase; }
    .status-paid { background: #d4edda; color: #27ae60; }
    .status-pending { background: #fef9e7; color: #f39c12; }
    .status-overdue { background: #fce4e4; color: #e74c3c; }

    /* Buttons */
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 6px; font-size: 0.9rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .btn-danger:hover { background: #fce4e4; }

    /* Empty State */
    .empty-state { text-align: center; padding: 2.5rem; color: #65676b; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }

    /* Balance Table */
    .balance-table { overflow: hidden; }
    .table-header, .table-row, .table-footer { display: flex; padding: 0.6rem 1.25rem; border-bottom: 1px solid #f0f2f5; }
    .table-header { background: #f8f9fa; font-weight: 600; font-size: 0.85rem; color: #65676b; }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #f8f9fa; }
    .table-footer { background: #f0f2f5; font-size: 0.9rem; }
    .col-hist { flex: 2; }
    .col-ent, .col-sai { flex: 1; text-align: right; }
    .has-value { color: #1c1e21; }

    /* Responsive */
    @media (max-width: 700px) {
      .summary-row { grid-template-columns: 1fr 1fr; }
      .summary-row.summary-4 { grid-template-columns: 1fr 1fr; }
      .filter-row { flex-direction: column; }
      .filter-group { min-width: 100%; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class FinancialComponent implements OnInit {
  activeTab: 'entradas' | 'saidas' | 'balanco' = 'entradas';
  showForm = false;
  editingId: string | null = null;

  allTransactions: GenericModuleItem[] = [];
  filteredEntradas: GenericModuleItem[] = [];
  filteredSaidas: GenericModuleItem[] = [];
  categories: GenericModuleItem[] = [];

  // Filters
  filterMonth: string;
  filterYear: string;
  filterCategory = '';
  filterStatus = '';

  // Form data
  formData: GenericModuleRequest = { amount: 0, description: '', name: '' };
  entryType = 'Tithe';
  entryDate = '';
  paymentMethod = '';
  expenseCategory = '';
  dueDate = '';
  paidStatus = 'N';

  // Totals - Entradas
  totalTithes = 0;
  totalOfferings = 0;
  totalEntradas = 0;

  // Totals - Saídas
  totalPaid = 0;
  totalPending = 0;
  totalOverdue = 0;
  totalSaidas = 0;

  // Balanço
  balancoReceitas = 0;
  balancoDespesas = 0;
  balancoMes = 0;
  saldoAnterior = 0;
  saldoTotal = 0;
  balancoRows: { description: string; income: number; expense: number }[] = [];

  months = [
    { value: '0', label: 'Janeiro' }, { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' }, { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' }, { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' }, { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' }, { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' }, { value: '11', label: 'Dezembro' }
  ];
  years: string[] = [];

  private txLabels: Record<string, string> = { Tithe: 'Dízimo', Offering: 'Oferta', Expense: 'Despesa', Donation: 'Doação', Other: 'Outro' };
  private txEmojis: Record<string, string> = { Tithe: '🙏', Offering: '💝', Expense: '💸', Donation: '🎁', Other: '📝' };

  constructor(private authService: AuthService, private financialService: FinancialService) {
    const now = new Date();
    this.filterMonth = now.getMonth().toString();
    this.filterYear = now.getFullYear().toString();
    const currentYear = now.getFullYear();
    this.years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];
  }

  ngOnInit(): void {
    this.entryDate = new Date().toISOString().split('T')[0];
    if (this.authService.currentCommunityId) {
      this.loadData();
      this.loadCategories();
    }
  }

  loadData(): void {
    this.financialService.getTransactions().subscribe(r => {
      if (r.success && r.data) {
        this.allTransactions = r.data;
        this.applyFilters();
      }
    });
  }

  loadCategories(): void {
    this.financialService.getCategories().subscribe(r => { if (r.success && r.data) this.categories = r.data; });
  }

  applyFilters(): void {
    const month = parseInt(this.filterMonth, 10);
    const year = parseInt(this.filterYear, 10);

    // All transactions in selected month/year
    const monthTx = this.allTransactions.filter(t => {
      const d = new Date(t.startDate || t.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    // All transactions before selected month (for saldo anterior)
    const beforeTx = this.allTransactions.filter(t => {
      const d = new Date(t.startDate || t.createdAt);
      const txMonth = d.getMonth();
      const txYear = d.getFullYear();
      return txYear < year || (txYear === year && txMonth < month);
    });

    // ========== ENTRADAS ==========
    let entradas = monthTx.filter(t => this.getTxType(t) !== 'expense');
    if (this.filterCategory) {
      entradas = entradas.filter(t => t.name === this.filterCategory || t.metadata?.['type'] === this.filterCategory);
    }
    this.filteredEntradas = entradas;
    this.totalTithes = entradas.filter(t => t.name === 'Tithe').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalOfferings = entradas.filter(t => t.name === 'Offering').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalEntradas = entradas.reduce((s, t) => s + (t.amount ?? 0), 0);

    // ========== SAÍDAS ==========
    let saidas = monthTx.filter(t => this.getTxType(t) === 'expense');
    if (this.filterStatus) {
      saidas = saidas.filter(t => this.getRawStatus(t) === this.filterStatus);
    }
    this.filteredSaidas = saidas;
    this.totalPaid = saidas.filter(t => this.getRawStatus(t) === 'paid').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalPending = saidas.filter(t => this.getRawStatus(t) === 'pending').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalOverdue = saidas.filter(t => this.getRawStatus(t) === 'overdue').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalSaidas = saidas.reduce((s, t) => s + (t.amount ?? 0), 0);

    // ========== BALANÇO ==========
    this.balancoReceitas = entradas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balancoDespesas = saidas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balancoMes = this.balancoReceitas - this.balancoDespesas;

    const prevEntradas = beforeTx.filter(t => this.getTxType(t) !== 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    const prevSaidas = beforeTx.filter(t => this.getTxType(t) === 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.saldoAnterior = prevEntradas - prevSaidas;
    this.saldoTotal = this.saldoAnterior + this.balancoMes;

    // Balanço rows: group by category
    const categoryMap = new Map<string, { income: number; expense: number }>();

    entradas.forEach(t => {
      const cat = t.metadata?.['categoryName'] || this.txLabels[t.name ?? ''] || 'Outros';
      const existing = categoryMap.get(cat) || { income: 0, expense: 0 };
      existing.income += t.amount ?? 0;
      categoryMap.set(cat, existing);
    });

    saidas.forEach(t => {
      const cat = t.metadata?.['expenseCategory'] || t.description || 'Despesas';
      const existing = categoryMap.get(cat) || { income: 0, expense: 0 };
      existing.expense += t.amount ?? 0;
      categoryMap.set(cat, existing);
    });

    this.balancoRows = Array.from(categoryMap.entries()).map(([description, data]) => ({
      description, ...data
    }));
  }

  onSubmit(): void {
    if (this.activeTab === 'entradas') {
      const meta: Record<string, string> = { type: this.entryType };
      if (this.paymentMethod) meta['paymentMethod'] = this.paymentMethod;
      const req: GenericModuleRequest = {
        name: this.entryType,
        amount: this.formData.amount,
        description: this.formData.description || (this.entryType === 'Tithe' ? 'Dízimo' : this.entryType === 'Offering' ? 'Oferta' : 'Doação'),
        startDate: this.entryDate,
        metadata: meta
      };
      if (this.editingId) {
        this.financialService.updateTransaction(this.editingId, req).subscribe(() => { this.loadData(); this.cancelEdit(); });
      } else {
        this.financialService.createTransaction(req).subscribe(() => { this.loadData(); this.cancelEdit(); });
      }
    } else if (this.activeTab === 'saidas') {
      const meta: Record<string, string> = { type: 'Expense', expenseCategory: this.expenseCategory, paidStatus: this.paidStatus };
      if (this.dueDate) meta['dueDate'] = this.dueDate;
      const req: GenericModuleRequest = {
        name: 'Expense',
        amount: this.formData.amount,
        description: this.formData.description,
        startDate: this.entryDate,
        metadata: meta
      };
      if (this.editingId) {
        this.financialService.updateTransaction(this.editingId, req).subscribe(() => { this.loadData(); this.cancelEdit(); });
      } else {
        this.financialService.createTransaction(req).subscribe(() => { this.loadData(); this.cancelEdit(); });
      }
    }
  }

  edit(t: GenericModuleItem): void {
    this.editingId = t.id;
    const isExpense = this.getTxType(t) === 'expense';
    if (isExpense) {
      this.activeTab = 'saidas';
      this.formData = { amount: t.amount ?? 0, description: t.description ?? '', name: 'Expense' };
      this.expenseCategory = t.metadata?.['expenseCategory'] ?? '';
      this.paidStatus = t.metadata?.['paidStatus'] ?? 'N';
      this.dueDate = t.metadata?.['dueDate'] ?? '';
    } else {
      this.activeTab = 'entradas';
      this.formData = { amount: t.amount ?? 0, description: t.description ?? '', name: t.name ?? 'Tithe' };
      this.entryType = t.name ?? 'Tithe';
      this.paymentMethod = t.metadata?.['paymentMethod'] ?? '';
    }
    this.entryDate = t.startDate ? t.startDate.split('T')[0] : t.createdAt.split('T')[0];
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
    this.entryType = 'Tithe';
    this.entryDate = new Date().toISOString().split('T')[0];
    this.paymentMethod = '';
    this.expenseCategory = '';
    this.dueDate = '';
    this.paidStatus = 'N';
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

  getRawStatus(t: GenericModuleItem): string {
    const paid = t.metadata?.['paidStatus'];
    if (paid === 'S') return 'paid';
    const dueDate = t.metadata?.['dueDate'];
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
