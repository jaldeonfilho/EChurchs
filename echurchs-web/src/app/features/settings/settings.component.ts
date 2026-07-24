import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';
import { MembershipResponse } from '../../core/models/community.model';
import { UpdateProfileRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header card">
        <h2>Configurações</h2>
      </div>

      <!-- Profile -->
      <div class="card settings-section">
        <div class="section-header">
          <h3>Meu Perfil</h3>
          <button class="btn-edit" (click)="openEditModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            Editar perfil
          </button>
        </div>

        <div class="profile-grid">
          <div class="field">
            <label>Nome</label>
            <span>{{ form.name || '—' }}</span>
          </div>
          <div class="field">
            <label>Email</label>
            <span>{{ userEmail }}</span>
          </div>
          <div class="field">
            <label>Telefone</label>
            <span>{{ form.phone || '—' }}</span>
          </div>
          <div class="field">
            <label>Data de nascimento</label>
            <span>{{ form.dateOfBirth ? (form.dateOfBirth | date:'dd/MM/yyyy') : '—' }}</span>
          </div>
          <div class="field">
            <label>Género</label>
            <span>{{ form.gender || '—' }}</span>
          </div>
          <div class="field">
            <label>Estado civil</label>
            <span>{{ form.maritalStatus || '—' }}</span>
          </div>
          <div class="field full">
            <label>Morada</label>
            <span>{{ form.address || '—' }}</span>
          </div>
          <div class="field">
            <label>Código postal</label>
            <span>{{ form.postalCode || '—' }}</span>
          </div>
          <div class="field">
            <label>Localidade</label>
            <span>{{ form.city || '—' }}</span>
          </div>
          <div class="field">
            <label>Distrito</label>
            <span>{{ form.district || '—' }}</span>
          </div>
          <div class="field full">
            <label>Biografia</label>
            <span>{{ form.bio || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Community Settings (Admin only) -->
      <div class="card settings-section" *ngIf="isAdmin">
        <h3>Gerir Comunidade</h3>
        <div class="community-admin-info">
          <p>Como administrador, pode gerir membros, planos e configurações da comunidade.</p>
        </div>
        <div class="admin-section" *ngIf="pendingMembers.length > 0">
          <h4>Solicitações Pendentes ({{ pendingMembers.length }})</h4>
          <div class="pending-list">
            <div class="pending-item" *ngFor="let m of pendingMembers">
              <div class="pending-avatar">{{ m.userName.charAt(0) }}</div>
              <div class="pending-info">
                <strong>{{ m.userName }}</strong>
                <span>{{ m.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="pending-actions">
                <button class="btn-accept" (click)="approveMember(m)">Aceitar</button>
                <button class="btn-reject" (click)="rejectMember(m)">Rejeitar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Community Info -->
      <div class="card settings-section">
        <h3>Minha Comunidade</h3>
        <div class="community-detail">
          <label>Nome</label>
          <span>{{ communityName }}</span>
        </div>
        <div class="community-detail">
          <label>Função</label>
          <span class="role-badge">{{ getRoleName(currentRole) }}</span>
        </div>
        <div class="community-detail">
          <label>Plano</label>
          <span>{{ planName }}</span>
        </div>
      </div>

      <!-- Leave Community -->
      <div class="card settings-section danger-zone">
        <h3>Sair da Comunidade</h3>
        <p>Sair da comunidade removerá seu acesso aos dados e funcionalidades.</p>
        <button class="btn-danger" (click)="leaveCommunity()">Sair da Comunidade</button>
      </div>

      <!-- Edit Profile Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Editar Perfil</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Nome completo</label>
                <input type="text" [(ngModel)]="modalForm.name" placeholder="Nome">
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input type="tel" [(ngModel)]="modalForm.phone" placeholder="+351 XXX XXX XXX">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Data de nascimento</label>
                <input type="date" [(ngModel)]="modalForm.dateOfBirth">
              </div>
              <div class="form-group">
                <label>Género</label>
                <select [(ngModel)]="modalForm.gender">
                  <option value="">Não especificado</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Estado civil</label>
                <select [(ngModel)]="modalForm.maritalStatus">
                  <option value="">Não especificado</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="União de facto">União de facto</option>
                </select>
              </div>
              <div class="form-group">
                <label>Código postal</label>
                <input type="text" [(ngModel)]="modalForm.postalCode" placeholder="XXXX-XXX">
              </div>
            </div>
            <div class="form-group">
              <label>Morada</label>
              <input type="text" [(ngModel)]="modalForm.address" placeholder="Rua, número, andar">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Localidade</label>
                <input type="text" [(ngModel)]="modalForm.city" placeholder="Cidade/Localidade">
              </div>
              <div class="form-group">
                <label>Distrito</label>
                <input type="text" [(ngModel)]="modalForm.district" placeholder="Distrito">
              </div>
            </div>
            <div class="form-group">
              <label>Biografia</label>
              <textarea [(ngModel)]="modalForm.bio" rows="3" placeholder="Conte-nos um pouco sobre si..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-save" (click)="saveProfile()" [disabled]="saving">
              {{ saving ? 'A guardar...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 680px; margin: 0 auto; padding: 1rem; }
    .card { background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-bottom: 0.75rem; }
    .page-header { display: flex; align-items: center; padding: 1rem 1.25rem; }
    .page-header h2 { margin: 0; font-size: 1.15rem; }
    .settings-section { padding: 1.25rem; }
    .settings-section h3 { margin: 0 0 1rem; font-size: 1rem; color: #1c1e21; }
    .settings-section h4 { margin: 0 0 0.75rem; font-size: 0.9rem; color: #65676b; }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .section-header h3 { margin: 0; }
    .btn-edit { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border: 1px solid #ddd; border-radius: 6px; background: white; color: #1c1e21; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .btn-edit:hover { background: #f0f2f5; }
    .btn-edit svg { color: #65676b; }

    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.5rem; }
    .profile-grid .full { grid-column: 1 / -1; }
    .field label { display: block; font-size: 0.75rem; font-weight: 600; color: #8a8d91; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 0.2rem; }
    .field span { font-size: 0.9rem; color: #1c1e21; word-break: break-word; }

    .community-admin-info { background: #e7f3ff; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; color: #1877f2; }
    .admin-section { margin-top: 1rem; }
    .pending-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #f0f2f5; }
    .pending-item:last-child { border-bottom: none; }
    .pending-avatar { width: 36px; height: 36px; border-radius: 50%; background: #f39c12; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
    .pending-info { flex: 1; }
    .pending-info strong { display: block; font-size: 0.9rem; }
    .pending-info span { font-size: 0.8rem; color: #65676b; }
    .pending-actions { display: flex; gap: 0.5rem; }
    .btn-accept { padding: 0.3rem 0.6rem; background: #1877f2; color: white; border: none; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .btn-reject { padding: 0.3rem 0.6rem; background: #e4e6eb; color: #1c1e21; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
    .community-detail { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f0f2f5; }
    .community-detail:last-child { border-bottom: none; }
    .community-detail label { font-size: 0.85rem; color: #65676b; }
    .community-detail span { font-weight: 500; }
    .role-badge { background: #e7f3ff; color: #1877f2; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600; }
    .danger-zone { border: 1px solid #fce4e4; }
    .danger-zone h3 { color: #e74c3c; }
    .danger-zone p { font-size: 0.85rem; color: #65676b; margin-bottom: 0.75rem; }
    .btn-danger { padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal { width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; border-radius: 12px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #eee; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; color: #1c1e21; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: #65676b; cursor: pointer; padding: 0; line-height: 1; }
    .close-btn:hover { color: #1c1e21; }
    .modal-body { padding: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { margin-bottom: 0.75rem; }
    .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #65676b; margin-bottom: 0.3rem; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #dddfe2; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; outline: none; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #1877f2; box-shadow: 0 0 0 1px #1877f2; }
    .form-group textarea { resize: vertical; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid #eee; }
    .btn-cancel { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px; background: white; color: #65676b; font-size: 0.85rem; cursor: pointer; }
    .btn-cancel:hover { background: #f0f2f5; }
    .btn-save { padding: 0.5rem 1.25rem; border: none; border-radius: 6px; background: #1877f2; color: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .btn-save:hover { background: #166fe5; }
    .btn-save:disabled { background: #a0c3ff; cursor: not-allowed; }

    @media (max-width: 600px) { .profile-grid, .form-row { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent implements OnInit {
  userEmail = '';
  communityName = '';
  planName = 'Free';
  currentRole = '';
  isAdmin = false;
  pendingMembers: MembershipResponse[] = [];

  form: UpdateProfileRequest = {};
  showModal = false;
  modalForm: UpdateProfileRequest = {};
  saving = false;

  constructor(
    private authService: AuthService,
    private communityService: CommunityService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.userEmail = user.email;
      this.currentRole = user.memberships?.[0]?.role ?? '';
      this.isAdmin = this.authService.isAdmin;
      this.form = {
        name: user.name,
        phone: user.phone || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        maritalStatus: user.maritalStatus || '',
        address: user.address || '',
        city: user.city || '',
        district: user.district || '',
        postalCode: user.postalCode || ''
      };
    }
    this.communityName = this.authService.currentCommunityName ?? '';
    this.loadPending();
  }

  loadPending(): void {
    const cid = this.authService.currentCommunityId;
    if (cid && this.isAdmin) {
      this.communityService.getPending(cid).subscribe(r => {
        if (r.success && r.data) this.pendingMembers = r.data;
      });
    }
  }

  openEditModal(): void {
    this.modalForm = { ...this.form };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProfile(): void {
    this.saving = true;
    const request: UpdateProfileRequest = {};
    if (this.modalForm.name) request.name = this.modalForm.name;
    if (this.modalForm.phone) request.phone = this.modalForm.phone;
    if (this.modalForm.bio) request.bio = this.modalForm.bio;
    if (this.modalForm.dateOfBirth) request.dateOfBirth = this.modalForm.dateOfBirth;
    if (this.modalForm.gender) request.gender = this.modalForm.gender;
    if (this.modalForm.maritalStatus) request.maritalStatus = this.modalForm.maritalStatus;
    if (this.modalForm.address) request.address = this.modalForm.address;
    if (this.modalForm.city) request.city = this.modalForm.city;
    if (this.modalForm.district) request.district = this.modalForm.district;
    if (this.modalForm.postalCode) request.postalCode = this.modalForm.postalCode;

    this.authService.updateProfile(request).subscribe({
      next: (r) => {
        this.saving = false;
        if (r.success) {
          this.form = { ...this.modalForm };
          this.closeModal();
        }
      },
      error: () => { this.saving = false; }
    });
  }

  approveMember(m: MembershipResponse): void {
    this.communityService.membershipAction({ membershipId: m.id, action: 'approve' }).subscribe(() => this.loadPending());
  }

  rejectMember(m: MembershipResponse): void {
    this.communityService.membershipAction({ membershipId: m.id, action: 'reject' }).subscribe(() => this.loadPending());
  }

  leaveCommunity(): void {
    if (confirm('Tem certeza que deseja sair da comunidade?')) {
      this.communityService.leave().subscribe(r => {
        if (r.success) {
          localStorage.removeItem('currentUser');
          window.location.reload();
        }
      });
    }
  }

  getRoleName(role: string): string {
    const map: Record<string, string> = { Admin: 'Administrador', FinancialManager: 'Financeiro', Leader: 'Líder', Member: 'Membro' };
    return map[role] || role;
  }
}
