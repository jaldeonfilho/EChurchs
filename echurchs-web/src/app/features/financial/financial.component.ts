import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
        <h2>{{ selectedTitle }}</h2>
        <button class="btn-primary" *ngIf="isAdminOrFinancial && activeSection !== 'balanco' && !showForm" (click)="openForm()">+ Novo</button>
      </div>

        <!-- ==================== ENTRADAS ==================== -->
        <ng-container *ngIf="isAdminOrFinancial && activeSection === 'entradas'">
          <!-- Filtros -->
          <div class="filters card">
            <div class="filter-row">
<div class="filter-group">
              <label>Mês Referência</label>
              <select [(ngModel)]="entFilterMonth" (ngModelChange)="filterEntradas()">
                <option value="">Todos</option>
                <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Ano</label>
              <select [(ngModel)]="entFilterYear" (ngModelChange)="filterEntradas()">
                <option value="">Todos</option>
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Membro</label>
              <select [(ngModel)]="entFilterMember" (ngModelChange)="filterEntradas()">
                <option value="">Todos</option>
                <option *ngFor="let m of members" [value]="m.userId">{{ m.userName }}</option>
              </select>
            </div>
              <div class="filter-group">
                <label>Categoria</label>
                <select [(ngModel)]="entFilterCategory" (ngModelChange)="filterEntradas()">
                  <option value="">Todas</option>
                  <option value="Tithe">Dízimo</option>
                  <option value="Offering">Oferta</option>
                  <option value="Donation">Doação</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Totais -->
          <div class="summary-row">
            <div class="summary-card card">
              <span class="summary-label">Total Dízimos</span>
              <span class="summary-value income">{{ totalEntTithes | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Ofertas</span>
              <span class="summary-value offering">{{ totalEntOfferings | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Entradas</span>
              <span class="summary-value total">{{ totalEntAll | number:'1.2-2' }} EUR</span>
            </div>
          </div>

          <!-- Lista -->
          <div class="tx-list" *ngIf="!showForm">
            <div class="tx-item card" *ngFor="let t of filteredEntradas">
              <div class="tx-icon" [class.tx-icon-dizimo]="t.name === 'Tithe'" [class.tx-icon-oferta]="t.name !== 'Tithe'">{{ t.name === 'Tithe' ? '🙏' : '💝' }}</div>
              <div class="tx-info">
                <span class="tx-name">{{ getTxLabel(t) }}</span>
                <span class="tx-desc">{{ t.description || 'Sem descrição' }}</span>
                <div class="tx-meta">
                  <span class="tx-member" *ngIf="t.userName">{{ t.userName }}</span>
                  <span class="tx-ref" *ngIf="getReferenceLabel(t)">{{ getReferenceLabel(t) }}</span>
                </div>
              </div>
              <div class="tx-amount">{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
              <div class="tx-actions" *ngIf="isAdminOrFinancial">
                <button class="btn-icon edit" (click)="edit(t)">✏️</button>
                <button class="btn-icon delete" (click)="deleteTransaction(t.id)">🗑️</button>
              </div>
            </div>
            <div class="empty card" *ngIf="filteredEntradas.length === 0">
              <p>Nenhuma entrada para este período</p>
            </div>
          </div>
        </ng-container>

        <!-- ==================== SAÍDAS ==================== -->
        <ng-container *ngIf="isAdminOrFinancial && activeSection === 'saidas'">
          <div class="filters card">
            <div class="filter-row">
              <div class="filter-group">
                <label>Mês Referência</label>
                <select [(ngModel)]="saiFilterMonth" (ngModelChange)="filterSaidas()">
                  <option value="">Todos</option>
                  <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Ano</label>
                <select [(ngModel)]="saiFilterYear" (ngModelChange)="filterSaidas()">
                  <option value="">Todos</option>
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Descrição/Categoria</label>
                <input type="text" [(ngModel)]="saiFilterSearch" (ngModelChange)="filterSaidas()" placeholder="Pesquisar...">
              </div>
              <div class="filter-group">
                <label>Estado</label>
                <div class="checkbox-group">
                  <label class="chk-label"><input type="checkbox" [(ngModel)]="saiFilterPago" (ngModelChange)="filterSaidas()"> Pago</label>
                  <label class="chk-label"><input type="checkbox" [(ngModel)]="saiFilterPendente" (ngModelChange)="filterSaidas()"> Pendente</label>
                  <label class="chk-label"><input type="checkbox" [(ngModel)]="saiFilterVencido" (ngModelChange)="filterSaidas()"> Vencido</label>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-row summary-4">
            <div class="summary-card card">
              <span class="summary-label">Total Pago</span>
              <span class="summary-value paid">{{ saiTotalPago | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Pendente</span>
              <span class="summary-value pending">{{ saiTotalPendente | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Vencido</span>
              <span class="summary-value overdue">{{ saiTotalVencido | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Saídas</span>
              <span class="summary-value expense">{{ saiTotalAll | number:'1.2-2' }} EUR</span>
            </div>
          </div>

          <div class="tx-list" *ngIf="!showForm">
            <div class="tx-item card" *ngFor="let t of filteredSaidas">
              <div class="tx-icon tx-icon-despesa">💸</div>
              <div class="tx-info">
                <span class="tx-name">{{ t.description || t.name || 'Sem descrição' }}</span>
                <span class="tx-desc">{{ t.expenseCategory || t.metadata?.['expenseCategory'] || 'Sem categoria' }}</span>
                <div class="tx-meta">
                  <span class="tx-ref" *ngIf="getReferenceLabel(t)">{{ getReferenceLabel(t) }}</span>
                  <span class="tx-venc" *ngIf="t.dueDate">Vence: {{ t.dueDate | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <span class="status-badge" [class]="getStatusClass(t)">{{ getStatusLabel(t) }}</span>
              <div class="tx-amount expense">{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
              <div class="tx-actions">
                <button class="btn-icon edit" (click)="edit(t)">✏️</button>
                <button class="btn-icon delete" (click)="deleteTransaction(t.id)">🗑️</button>
              </div>
            </div>
            <div class="empty card" *ngIf="filteredSaidas.length === 0">
              <p>Nenhuma saída para este período</p>
            </div>
          </div>
        </ng-container>

        <!-- ==================== BALANÇO GERAL ==================== -->
        <ng-container *ngIf="isAdminOrFinancial && activeSection === 'balanco'">
          <div class="filters card">
            <div class="filter-row">
              <div class="filter-group">
                <label>Mês</label>
                <select [(ngModel)]="balFilterMonth" (ngModelChange)="filterBalanco()">
                  <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Ano</label>
                <select [(ngModel)]="balFilterYear" (ngModelChange)="filterBalanco()">
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="summary-row summary-3">
            <div class="summary-card card">
              <span class="summary-label">Total Receitas</span>
              <span class="summary-value income">{{ balReceitas | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Despesas</span>
              <span class="summary-value expense">{{ balDespesas | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card" [class.positive]="balSaldoMes >= 0" [class.negative]="balSaldoMes < 0">
              <span class="summary-label">Saldo do Mês</span>
              <span class="summary-value">{{ balSaldoMes | number:'1.2-2' }} EUR</span>
            </div>
          </div>
          <div class="summary-row summary-2">
            <div class="summary-card card">
              <span class="summary-label">Saldo Anterior</span>
              <span class="summary-value previous">{{ balSaldoAnterior | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card" [class.positive]="balSaldoTotal >= 0" [class.negative]="balSaldoTotal < 0">
              <span class="summary-label">Saldo Total</span>
              <span class="summary-value total-bal">{{ balSaldoTotal | number:'1.2-2' }} EUR</span>
            </div>
          </div>

          <div class="balance-table card">
            <div class="table-header">
              <span class="col-data">Data</span>
              <span class="col-hist">Histórico</span>
              <span class="col-ent">Entradas</span>
              <span class="col-sai">Saídas</span>
            </div>
            <div class="table-row" *ngFor="let row of balRows" [class.entrada]="row.saidas === 0" [class.saida]="row.entradas === 0">
              <span class="col-data bold">{{ row.date ? (row.date | date:'dd/MMM') : '-' }}</span>
              <span class="col-hist"><span class="blue-bold" *ngIf="row.saidas === 0 && row.entradas > 0">{{ row.label }}</span><span class="bold" *ngIf="row.entradas === 0 && row.saidas > 0">{{ row.label }}</span><span *ngIf="row.desc"> {{ row.desc }}</span></span>
              <span class="col-ent green-bold" [class.has-value]="row.entradas > 0">{{ row.entradas > 0 ? (row.entradas | number:'1.2-2') + ' EUR' : '-' }}</span>
              <span class="col-sai red-bold" [class.has-value]="row.saidas > 0">{{ row.saidas > 0 ? (row.saidas | number:'1.2-2') + ' EUR' : '-' }}</span>
            </div>
            <div class="table-footer">
              <span class="col-data"></span>
              <span class="col-hist"><strong>Total do Mês</strong></span>
              <span class="col-ent"><strong>{{ balReceitas | number:'1.2-2' }} EUR</strong></span>
              <span class="col-sai"><strong>{{ balDespesas | number:'1.2-2' }} EUR</strong></span>
            </div>
            <div class="empty" *ngIf="balRows.length === 0">
              <p>Sem dados para este período</p>
            </div>
          </div>
        </ng-container>

        <!-- ==================== MEMBRO: MINHAS DOAÇÕES ==================== -->
        <ng-container *ngIf="!isAdminOrFinancial">
          <div class="filters card">
            <div class="filter-row">
              <div class="filter-group">
                <label>Mês</label>
                <select [(ngModel)]="entFilterMonth" (ngModelChange)="filterEntradas()">
                  <option value="">Todos</option>
                  <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Ano</label>
                <select [(ngModel)]="entFilterYear" (ngModelChange)="filterEntradas()">
                  <option value="">Todos</option>
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Tipo</label>
                <select [(ngModel)]="entFilterCategory" (ngModelChange)="filterEntradas()">
                  <option value="">Todos</option>
                  <option value="Tithe">Dízimo</option>
                  <option value="Offering">Oferta</option>
                </select>
              </div>
            </div>
          </div>
          <div class="summary-row">
            <div class="summary-card card">
              <span class="summary-label">Total Dízimos</span>
              <span class="summary-value income">{{ totalMyTithes | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total Ofertas</span>
              <span class="summary-value offering">{{ totalMyOfferings | number:'1.2-2' }} EUR</span>
            </div>
            <div class="summary-card card">
              <span class="summary-label">Total</span>
              <span class="summary-value total">{{ (totalMyTithes + totalMyOfferings) | number:'1.2-2' }} EUR</span>
            </div>
          </div>
          <div class="tx-list">
            <div class="tx-item card" *ngFor="let t of filteredMyTx">
              <div class="tx-icon" [class.tx-icon-dizimo]="t.name === 'Tithe'" [class.tx-icon-oferta]="t.name !== 'Tithe'">{{ t.name === 'Tithe' ? '🙏' : '💝' }}</div>
              <div class="tx-info">
                <span class="tx-name">{{ getTxLabel(t) }}</span>
                <span class="tx-desc">{{ t.description || 'Sem descrição' }}</span>
                <div class="tx-meta">
                  <span class="tx-ref" *ngIf="getReferenceLabel(t)">{{ getReferenceLabel(t) }}</span>
                </div>
              </div>
              <div class="tx-amount income">{{ (t.amount ?? 0) | number:'1.2-2' }} EUR</div>
            </div>
            <div class="empty card" *ngIf="filteredMyTx.length === 0">
              <p>Nenhuma doação para este período</p>
            </div>
          </div>
        </ng-container>

        <!-- ==================== FORMULÁRIO ==================== -->
        <div class="form-card card" *ngIf="showForm && isAdminOrFinancial">
          <h3>{{ editingId ? 'Editar' : (activeSection === 'saidas' ? 'Nova Despesa' : 'Nova Entrada') }}</h3>
          <form (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group" *ngIf="activeSection === 'entradas'">
                <label>Tipo *</label>
                <div class="radio-group">
                  <label class="radio-label"><input type="radio" name="entryType" value="Tithe" [(ngModel)]="entryType"> Dízimo</label>
                  <label class="radio-label"><input type="radio" name="entryType" value="Offering" [(ngModel)]="entryType"> Oferta</label>
                </div>
              </div>
              <div class="form-group">
                <label>Valor (EUR) *</label>
                <input type="number" [(ngModel)]="amount" name="amount" step="0.01" min="0" required>
              </div>
            </div>

            <div class="form-group" *ngIf="entryType === 'Tithe' && activeSection === 'entradas'">
              <label>Membro *</label>
              <select [(ngModel)]="selectedMemberId" name="memberId" required>
                <option value="">Selecione o membro</option>
                <option *ngFor="let m of members" [value]="m.userId">{{ m.userName }}</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Data *</label>
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

            <div class="form-group">
              <label>Descrição</label>
              <input type="text" [(ngModel)]="description" name="description" placeholder="Ex: Dízimo mensal de julho">
            </div>

            <ng-container *ngIf="activeSection === 'entradas'">
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

            <ng-container *ngIf="activeSection === 'saidas'">
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
                  <label>Estado</label>
                  <div class="radio-group">
                    <label class="radio-label"><input type="radio" name="paidStatus" value="S" [(ngModel)]="paidStatus"> Pago</label>
                    <label class="radio-label"><input type="radio" name="paidStatus" value="N" [(ngModel)]="paidStatus"> Pendente</label>
                  </div>
                </div>
              </div>
            </ng-container>

            <div class="form-actions">
              <button type="submit" class="btn-primary">Salvar</button>
              <button type="button" class="btn-secondary" (click)="cancelForm()">Cancelar</button>
            </div>
          </form>
        </div>
    </div>
  `,
  styles: [`
    .financial-page { max-width: 1000px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.08); margin-bottom: 0.75rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.1rem; }
    .btn-primary { padding: 0.45rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
    .btn-primary:hover { background: #166fe5; }
    .btn-secondary { padding: 0.45rem 1rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .filters { padding: 0.75rem 1.25rem; }
    .filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 0.2rem; min-width: 140px; }
    .filter-group label { font-size: 0.7rem; color: #65676b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .filter-group select, .filter-group input { padding: 0.4rem 0.6rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.85rem; outline: none; background: white; }
    .filter-group select:focus, .filter-group input:focus { border-color: #1877f2; }
    .checkbox-group { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.2rem; }
    .chk-label { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; color: #65676b; cursor: pointer; }
    .chk-label input { width: auto; }
    .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
    .summary-row.summary-4 { grid-template-columns: repeat(4, 1fr); }
    .summary-row.summary-2 { grid-template-columns: repeat(2, 1fr); }
    .summary-row.summary-3 { grid-template-columns: repeat(3, 1fr); }
    .summary-card { display: flex; flex-direction: column; align-items: center; padding: 0.7rem; }
    .summary-label { font-size: 0.7rem; color: #65676b; font-weight: 500; margin-bottom: 0.15rem; }
    .summary-value { font-size: 1rem; font-weight: 700; }
    .income { color: #27ae60; }
    .offering { color: #2ecc71; }
    .expense { color: #e74c3c; }
    .paid { color: #27ae60; }
    .pending { color: #f39c12; }
    .overdue { color: #e74c3c; }
    .total { color: #1877f2; }
    .previous { color: #7f8c8d; }
    .total-bal { color: #2c3e50; font-size: 1.1rem; }
    .positive .summary-value { color: #27ae60 !important; }
    .negative .summary-value { color: #e74c3c !important; }
    .tx-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .tx-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; }
    .tx-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .tx-icon-dizimo { background: #e8f5e9; }
    .tx-icon-oferta { background: #fff3e0; }
    .tx-icon-despesa { background: #fce4e4; }
    .tx-info { flex: 1; min-width: 0; }
    .tx-name { font-size: 0.9rem; font-weight: 600; display: block; color: #1c1e21; }
    .tx-desc { font-size: 0.78rem; color: #65676b; display: block; }
    .tx-meta { display: flex; gap: 0.4rem; margin-top: 0.15rem; flex-wrap: wrap; }
    .tx-member, .tx-ref, .tx-venc { font-size: 0.7rem; color: #1877f2; background: #e7f3ff; padding: 0.05rem 0.4rem; border-radius: 8px; }
    .tx-amount { font-weight: 700; font-size: 0.9rem; white-space: nowrap; flex-shrink: 0; }
    .tx-actions { display: flex; gap: 0.2rem; flex-shrink: 0; }
    .status-badge { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 10px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
    .status-paid { background: #d4edda; color: #27ae60; }
    .status-pending { background: #fef9e7; color: #f39c12; }
    .status-overdue { background: #fce4e4; color: #e74c3c; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 6px; font-size: 0.85rem; }
    .btn-icon:hover { background: #f0f2f5; }
    .edit:hover { background: #e7f3ff; }
    .delete:hover { background: #fce4e4; }
    .empty { text-align: center; padding: 2rem; color: #65676b; font-size: 0.9rem; }
    .balance-table { overflow: hidden; }
    .table-header, .table-row, .table-footer { display: flex; padding: 0.5rem 1rem; border-bottom: 1px solid #f0f2f5; font-size: 0.85rem; }
    .table-header { background: #f8f9fa; font-weight: 600; color: #65676b; font-size: 0.8rem; }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #f8f9fa; }
    .table-footer { background: #f0f2f5; font-weight: 600; }
    .entrada { }
    .saida { }
    .bold { font-weight: 700; }
    .blue-bold { font-weight: 700; color: #1877f2; }
    .green-bold { font-weight: 700; color: #27ae60; }
    .red-bold { font-weight: 700; color: #e74c3c; }
    .col-data { width: 70px; flex-shrink: 0; }
    .col-hist { flex: 2; padding-left: 0.5rem; }
    .col-ent, .col-sai { width: 110px; text-align: right; flex-shrink: 0; }
    .form-card { padding: 1.25rem; }
    .form-card h3 { margin: 0 0 0.8rem; font-size: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-row-ref { display: flex; gap: 0.5rem; }
    .form-row-ref select { flex: 1; }
    .form-group { margin-bottom: 0.65rem; }
    .form-group label { display: block; margin-bottom: 0.2rem; font-weight: 500; font-size: 0.82rem; }
    .form-group input, .form-group select { width: 100%; padding: 0.5rem 0.7rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.88rem; box-sizing: border-box; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #1877f2; }
    .form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .radio-group { display: flex; gap: 1rem; padding-top: 0.2rem; flex-wrap: wrap; }
    .radio-label { display: flex; align-items: center; gap: 0.25rem; font-size: 0.88rem; cursor: pointer; }
    .radio-label input[type="radio"] { width: auto; }
    @media (max-width: 768px) {
      .summary-row, .summary-row.summary-4, .summary-row.summary-3 { grid-template-columns: 1fr 1fr; }
      .filter-row { flex-direction: column; }
      .filter-group { min-width: 100%; }
      .tx-item { flex-wrap: wrap; }
    }
  `]
})
export class FinancialComponent implements OnInit {
  activeSection: 'entradas' | 'saidas' | 'balanco' | 'doacoes' = 'entradas';
  showForm = false;
  editingId: string | null = null;
  isAdminOrFinancial = false;
  routeSub: Subscription = new Subscription();

  allTransactions: GenericModuleItem[] = [];
  members: MembershipResponse[] = [];

  // Entradas
  entFilterMonth: string | null = null;
  entFilterYear: string | null = null;
  entFilterMember: string | null = null;
  entFilterCategory = '';
  filteredEntradas: GenericModuleItem[] = [];
  totalEntTithes = 0;
  totalEntOfferings = 0;
  totalEntAll = 0;

  // Saidas
  saiFilterMonth: string | null = null;
  saiFilterYear: string | null = null;
  saiFilterSearch = '';
  saiFilterPago = false;
  saiFilterPendente = false;
  saiFilterVencido = false;
  filteredSaidas: GenericModuleItem[] = [];
  saiTotalPago = 0;
  saiTotalPendente = 0;
  saiTotalVencido = 0;
  saiTotalAll = 0;

  // Balanço
  balFilterMonth = '';
  balFilterYear = '';
  balReceitas = 0;
  balDespesas = 0;
  balSaldoMes = 0;
  balSaldoAnterior = 0;
  balSaldoTotal = 0;
  balRows: { date: string; label: string; desc: string; entradas: number; saidas: number }[] = [];

  // Member view
  filteredMyTx: GenericModuleItem[] = [];
  totalMyTithes = 0;
  totalMyOfferings = 0;

  // Form
  entryType = 'Tithe';
  amount = 0;
  entryDate = '';
  referenceMonth = '';
  referenceYear = '';
  description = '';
  paymentMethod = '';
  expenseCategory = '';
  dueDate = '';
  paidStatus = 'S';
  selectedMemberId = '';

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

  get selectedTitle(): string {
    if (!this.isAdminOrFinancial) return 'Minhas Doações';
    return { entradas: 'Entradas (Dízimos e Ofertas)', saidas: 'Saídas (Contas a Pagar)', balanco: 'Balanço Geral', doacoes: 'Minhas Doações' }[this.activeSection] || '';
  }

  constructor(private authService: AuthService, private financialService: FinancialService, private route: ActivatedRoute) {
    const now = new Date();
    const year = now.getFullYear();
    this.years = [year.toString(), (year - 1).toString(), (year - 2).toString()];
    this.referenceMonth = (now.getMonth() + 1).toString();
    this.referenceYear = year.toString();
    this.balFilterMonth = (now.getMonth() + 1).toString();
    this.balFilterYear = year.toString();
  }

  ngOnInit(): void {
    this.entryDate = new Date().toISOString().split('T')[0];
    this.isAdminOrFinancial = this.authService.isAdmin || this.authService.isFinancialManager;

    this.routeSub = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'saidas') this.activeSection = 'saidas';
      else if (tab === 'balanco') this.activeSection = 'balanco';
      else this.activeSection = 'entradas';
    });

    if (this.authService.currentCommunityId) {
      if (this.isAdminOrFinancial) {
        this.loadData();
        this.loadMembers();
      } else {
        this.loadPersonalDonations();
      }
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  loadData(): void {
    this.financialService.getTransactions().subscribe(r => {
      if (r.success && r.data) {
        this.allTransactions = r.data;
        this.filterEntradas();
        this.filterSaidas();
        this.filterBalanco();
      }
    });
  }

  loadPersonalDonations(): void {
    this.financialService.getPersonalDonations().subscribe(r => {
      if (r.success && r.data) {
        this.allTransactions = r.data;
        this.applyMemberFilters();
      }
    });
  }

  loadMembers(): void {
    this.financialService.getMembersList().subscribe(r => {
      if (r.success && r.data) this.members = r.data;
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editingId = null;
    this.clearForm();
    if (this.activeSection === 'saidas') this.entryType = 'Expense';
  }

  filterEntradas(): void {
    const month = this.entFilterMonth ? parseInt(this.entFilterMonth, 10) : undefined;
    const year = this.entFilterYear ? parseInt(this.entFilterYear, 10) : undefined;
    let tx = this.allTransactions.filter(t => this.getTxType(t) !== 'expense');
    if (month !== undefined) tx = tx.filter(t => t.referenceMonth === month);
    if (year !== undefined) tx = tx.filter(t => t.referenceYear === year);
    if (this.entFilterMember) tx = tx.filter(t => t.userId === this.entFilterMember);
    if (this.entFilterCategory) tx = tx.filter(t => t.name === this.entFilterCategory || t.metadata?.['type'] === this.entFilterCategory);
    this.filteredEntradas = tx;
    this.totalEntTithes = tx.filter(t => t.name === 'Tithe').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalEntOfferings = tx.filter(t => t.name === 'Offering').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalEntAll = tx.reduce((s, t) => s + (t.amount ?? 0), 0);
  }

  filterSaidas(): void {
    const month = this.saiFilterMonth ? parseInt(this.saiFilterMonth, 10) : undefined;
    const year = this.saiFilterYear ? parseInt(this.saiFilterYear, 10) : undefined;
    let tx = this.allTransactions.filter(t => this.getTxType(t) === 'expense');
    if (month !== undefined) tx = tx.filter(t => t.referenceMonth === month);
    if (year !== undefined) tx = tx.filter(t => t.referenceYear === year);
    if (this.saiFilterSearch) {
      const s = this.saiFilterSearch.toLowerCase();
      tx = tx.filter(t => (t.description || '').toLowerCase().includes(s) || (t.expenseCategory || '').toLowerCase().includes(s));
    }
    const hasFilter = this.saiFilterPago || this.saiFilterPendente || this.saiFilterVencido;
    if (hasFilter) {
      tx = tx.filter(t => {
        const st = this.getRawStatus(t);
        if (this.saiFilterPago && st === 'paid') return true;
        if (this.saiFilterPendente && st === 'pending') return true;
        if (this.saiFilterVencido && st === 'overdue') return true;
        return false;
      });
    }
    this.filteredSaidas = tx;
    this.saiTotalPago = tx.filter(t => this.getRawStatus(t) === 'paid').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.saiTotalPendente = tx.filter(t => this.getRawStatus(t) === 'pending').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.saiTotalVencido = tx.filter(t => this.getRawStatus(t) === 'overdue').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.saiTotalAll = tx.reduce((s, t) => s + (t.amount ?? 0), 0);
  }

  filterBalanco(): void {
    const month = parseInt(this.balFilterMonth, 10);
    const year = parseInt(this.balFilterYear, 10);
    if (!month || !year) return;

    const mesTx = this.allTransactions.filter(t => t.referenceMonth === month && t.referenceYear === year);
    const entradas = mesTx.filter(t => this.getTxType(t) !== 'expense');
    const saidas = mesTx.filter(t => this.getTxType(t) === 'expense' && this.getRawStatus(t) === 'paid');

    this.balReceitas = entradas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balDespesas = saidas.reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balSaldoMes = this.balReceitas - this.balDespesas;

    const anteriorTx = this.allTransactions.filter(t => {
      return t.referenceYear! < year || (t.referenceYear === year && t.referenceMonth! < month);
    });
    const antEnt = anteriorTx.filter(t => this.getTxType(t) !== 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    const antSai = anteriorTx.filter(t => this.getTxType(t) === 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.balSaldoAnterior = antEnt - antSai;
    this.balSaldoTotal = this.balSaldoAnterior + this.balSaldoMes;

    const rows: { date: string; label: string; desc: string; entradas: number; saidas: number }[] = [];

    entradas.forEach(t => {
      const label = this.txLabels[t.name ?? ''] || t.name || 'Entrada';
      const desc = t.description || '';
      rows.push({
        date: t.startDate || '',
        label, desc,
        entradas: t.amount ?? 0,
        saidas: 0
      });
    });

    saidas.forEach(t => {
      const label = t.expenseCategory ? `[${t.expenseCategory}]` : 'Despesa';
      const desc = t.description || t.name || '';
      rows.push({
        date: t.dueDate || t.startDate || '',
        label, desc,
        entradas: 0,
        saidas: t.amount ?? 0
      });
    });

    rows.sort((a, b) => {
      if ((a.saidas > 0) !== (b.saidas > 0)) return a.saidas > 0 ? 1 : -1;
      return (a.date || '').localeCompare(b.date || '');
    });

    this.balRows = rows;
  }

  private applyMemberFilters(): void {
    const month = this.entFilterMonth ? parseInt(this.entFilterMonth, 10) : undefined;
    const year = this.entFilterYear ? parseInt(this.entFilterYear, 10) : undefined;
    let tx = this.allTransactions;
    if (month) tx = tx.filter(t => t.referenceMonth === month);
    if (year) tx = tx.filter(t => t.referenceYear === year);
    if (this.entFilterCategory) tx = tx.filter(t => t.name === this.entFilterCategory);
    this.filteredMyTx = tx;
    this.totalMyTithes = tx.filter(t => t.name === 'Tithe').reduce((s, t) => s + (t.amount ?? 0), 0);
    this.totalMyOfferings = tx.filter(t => t.name === 'Offering').reduce((s, t) => s + (t.amount ?? 0), 0);
  }

  onSubmit(): void {
    const meta: Record<string, string> = { type: this.entryType };
    if (this.paymentMethod) meta['paymentMethod'] = this.paymentMethod;
    if (this.paidStatus) meta['paidStatus'] = this.paidStatus;
    if (this.expenseCategory) meta['expenseCategory'] = this.expenseCategory;
    if (this.entryType === 'Tithe' && this.selectedMemberId) meta['memberId'] = this.selectedMemberId;

    const isExpense = this.activeSection === 'saidas';
    const req: GenericModuleRequest = {
      name: isExpense ? 'Expense' : this.entryType,
      amount: this.amount,
      description: this.description || (this.entryType === 'Tithe' ? 'Dízimo' : 'Oferta'),
      startDate: this.entryDate,
      referenceMonth: parseInt(this.referenceMonth, 10),
      referenceYear: parseInt(this.referenceYear, 10),
      dueDate: this.dueDate || undefined,
      expenseCategory: this.expenseCategory,
      metadata: meta
    };

    if (this.editingId) {
      this.financialService.updateTransaction(this.editingId, req).subscribe(() => { this.loadData(); this.cancelForm(); });
    } else {
      this.financialService.createTransaction(req).subscribe(() => { this.loadData(); this.cancelForm(); });
    }
  }

  edit(t: GenericModuleItem): void {
    this.editingId = t.id;
    this.activeSection = this.getTxType(t) === 'expense' ? 'saidas' : 'entradas';
    this.showForm = true;
    this.amount = t.amount ?? 0;
    this.description = t.description ?? '';
    this.entryType = (t.name === 'Expense' ? 'Expense' : t.name === 'Tithe' ? 'Tithe' : 'Offering') as any;
    this.entryDate = t.startDate ? t.startDate.split('T')[0] : t.createdAt.split('T')[0];
    this.referenceMonth = t.referenceMonth?.toString() ?? '';
    this.referenceYear = t.referenceYear?.toString() ?? '';
    this.paymentMethod = t.metadata?.['paymentMethod'] ?? '';
    this.expenseCategory = t.expenseCategory ?? t.metadata?.['expenseCategory'] ?? '';
    this.dueDate = t.dueDate ?? t.metadata?.['dueDate'] ?? '';
    this.paidStatus = t.metadata?.['paidStatus'] ?? 'S';
    this.selectedMemberId = t.userId ?? '';
  }

  deleteTransaction(id: string): void {
    if (confirm('Tem certeza que deseja eliminar este registo?')) {
      this.financialService.deleteTransaction(id).subscribe(() => this.loadData());
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.clearForm();
  }

  private clearForm(): void {
    this.amount = 0;
    this.description = '';
    this.entryType = 'Tithe';
    this.entryDate = new Date().toISOString().split('T')[0];
    this.referenceMonth = (new Date().getMonth() + 1).toString();
    this.referenceYear = new Date().getFullYear().toString();
    this.paymentMethod = '';
    this.expenseCategory = '';
    this.dueDate = '';
    this.paidStatus = 'S';
    this.selectedMemberId = '';
  }

  getTxType(t: GenericModuleItem): string {
    const type = t.metadata?.['type'] || t.name;
    return type === 'Expense' ? 'expense' : 'income';
  }

  getTxLabel(t: GenericModuleItem): string {
    return this.txLabels[(t.name ?? '')] || (t.name ?? '');
  }

  getReferenceLabel(t: GenericModuleItem): string {
    const rm = t.referenceMonth ?? 0;
    const ry = t.referenceYear ?? 0;
    if (rm === 0 || ry === 0) return '';
    const m = this.months.find(m => m.value === rm.toString());
    return `${m?.label ?? rm}/${ry}`;
  }

  getRawStatus(t: GenericModuleItem): string {
    if (t.metadata?.['paidStatus'] === 'S') return 'paid';
    if (t.dueDate || t.metadata?.['dueDate']) {
      const due = new Date(t.dueDate || t.metadata!['dueDate']);
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
