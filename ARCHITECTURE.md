# Echurchs - Arquitetura Refatorada

## Conceito
Rede social de igrejas. Cada pessoa cria uma conta pessoal, pode criar sua comunidade (igreja) ou solicitar entrada numa existente.

---

## Modelo de Usuário

### User (Pessoa - conta pessoal)
- Id, Name, Email, PasswordHash, ProfileImage, Phone, Bio
- IsActive, CreatedAt, UpdatedAt

**NÃO existe mais entidade Member separada.** O User É a pessoa. Todas as referências `MemberId` viram `UserId`.

---

## Modelo de Comunidade

### Community (substitui Tenant)
- Id, Name, Description, LogoUrl, Slug, Cnpj, Address, Phone, Email
- CreatedBy (UserId do criador/admin)
- IsActive, CreatedAt

### CommunityMembership (substitui UserRole)
- Id, UserId, CommunityId
- Role: Admin | FinancialManager | Leader | Member
- Status: Pending | Active | Rejected | Left
- JoinedAt
- **Cada User pertence a no máximo 1 Community**

### CommunitySubscription (substitui TenantSubscription)
- Id, CommunityId, PlanId, StartDate, EndDate, Status, PaymentMethod

---

## Fluxos Principais

### Cadastro e Login
1. Pessoa se cadastra (Name, Email, Password) → Account criada
2. Login → JWT com UserId
3. Primeira tela: "Criar minha comunidade" OU "Buscar comunidade para entrar"

### Criar Comunidade
1. Admin preenche dados da comunidade (Name, etc.)
2. Community criada, CommunityMembership com Role=Admin, Status=Active
3. CommunitySubscription com plano Free

### Solicitar Entrada em Comunidade
1. Usuário busca comunidade (por nome/slug)
2. Envia pedido → CommunityMembership com Status=Pending
3. Admin/Líder da comunidade aprova → Status=Active

---

## Hierarquia da Comunidade (4 níveis)

| Nível | Financeiro | Gestão | Membros |
|-------|-----------|--------|---------|
| **Admin** | Ver tudo + gerenciar | Tudo | Tudo |
| **FinancialManager** | Ver tudo + registrar pagamentos/despesas | Parcial | Ver lista |
| **Leader** | Ver seus próprios dizimos | Gerenciar seus grupos | Ver lista |
| **Member** | Ver seus próprios dizimos | Apenas visualizar | Ver lista |

---

## Módulos (escopo = Community)

### Pessoas/Membros
- Lista de membros da comunidade (quem tem acesso = todos os membros ativos)
- Perfil do membro visível para comunidade
- Campos customizados por comunidade (CustomField)

### Grupos
- GroupCategory (escopo Community)
- Group (CategoryId, LeaderId=UserId, escopo Community)
- GroupMember (GroupId, UserId)

### Agenda
- Bulletin (CommunityId, AuthorId=UserId)
- CalendarEvent (CommunityId, CreatedBy=UserId)
- EventRegistration (EventId, UserId)

### Mídias
- PhotoAlbum, Photo (escopo Community)
- VideoAlbum, Video (escopo Community)
- Document (CommunityId, CreatedBy=UserId)
- FormTemplate, FormField, FormResponse, FormResponseValue (escopo Community)

### Financeiro (DUPLO)
**Área Pessoal (visível para todos):**
- Cada membro vê seus próprios dízimos e ofertas na comunidade
- FinancialTransaction filtrado por UserId = currentUser

**Área Comunitária (Admin + FinancialManager):**
- Todas as receitas e despesas
- Categorias financeiras
- Extratos e relatórios
- GivingStatement

### Ensino
- Study (CommunityId, AuthorId=UserId)
- StudyAttachment
- Class (CommunityId, TeacherId=UserId)
- ClassAttachment, ClassMember (ClassId, UserId)

### Patrimônio
- AssetCategory (CommunityId)
- Asset (CommunityId, CategoryId)

### Cultos Online
- ServiceSchedule (CommunityId)
- LiveService (CommunityId, ScheduleId, CreatedBy=UserId)

### Doações
- Donation (CommunityId, UserId=donor) - **O membro logado como donor**
- PaymentLink (CommunityId)
- PaymentGatewayConfig (CommunityId) - Admin only

---

## Mensageria (Social)

### Friendship (Amizade entre usuários de diferentes comunidades)
- Id
- RequesterId (UserId quem pediu)
- AddresseeId (UserId quem recebe)
- Status: Pending | Accepted | Rejected | Blocked
- CreatedAt, UpdatedAt

### Conversation
- Id, IsGroup, Title (se grupo), CreatedAt

### ConversationParticipant
- ConversationId, UserId, JoinedAt, LeftAt

### Message
- ConversationId, SenderId (UserId), Content, SentAt, ReadAt
- Mensagens 1:1 (amigos) ou grupo (comunidade)

---

## Enum Atualizado

```
CommunityRole { Admin = 0, FinancialManager = 1, Leader = 2, Member = 3 }
MembershipStatus { Pending = 0, Active = 1, Rejected = 2, Left = 3 }
FriendshipStatus { Pending = 0, Accepted = 1, Rejected = 2, Blocked = 3 }
```
(mantém todos os outros enums existentes: PlanType, SubscriptionStatus, FieldType, TransactionType, etc.)

---

## Referências de Chave Estrangeira

Todas as entidades de módulo usam `CommunityId` em vez de `TenantId`:
- GroupCategory.CommunityId
- Group.CommunityId
- Bulletin.CommunityId
- CalendarEvent.CommunityId
- Document.CommunityId
- FormTemplate.CommunityId
- FinancialCategory.CommunityId
- FinancialTransaction.CommunityId (+ UserId para o doador)
- GivingStatement.CommunityId (+ UserId)
- Study.CommunityId
- Class.CommunityId
- AssetCategory.CommunityId
- Asset.CommunityId
- ServiceSchedule.CommunityId
- LiveService.CommunityId
- Donation.CommunityId (+ UserId)
- PaymentLink.CommunityId
- PaymentGatewayConfig.CommunityId

Todas as referências a `MemberId` viram `UserId`:
- GroupMember.UserId (era MemberId)
- Group.LeaderId (era MemberId, agora é UserId)
- EventRegistration.UserId (era MemberId)
- FormResponse.UserId (era MemberId)
- FinancialTransaction.UserId (era MemberId)
- GivingStatement.UserId (era MemberId)
- ClassMember.UserId (era MemberId)
- Class.TeacherId (era MemberId, agora é UserId)

**Removidas:** Member, MemberCustomField, MemberCustomFieldValue, PublicRegistrationLink
**Substituídas:** Tenant → Community, TenantSubscription → CommunitySubscription, UserRole → CommunityMembership

**Adicionadas:** Friendship, Conversation, ConversationParticipant, Message

---

## JWT Claims
- UserId (NameIdentifier)
- Email
- Name

**TenantId removido do JWT.** Resolução de comunidade é feita via `CommunityMembership` no banco.

---

## Middleware
- `TenantMiddleware` → `CommunityMiddleware`: resolve a comunidade do user logado a partir de CommunityMembership ativa
- Para endpoints de criação de comunidade/pedido de entrada, o middleware permite passar sem CommunityId
