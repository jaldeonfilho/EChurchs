# Navegação EChurchs — Plano de Arquitetura (Angular + .NET)

**Autor:** plano técnico (skill `/arquiteto`, adaptado ao stack real — Angular 17.3 + ASP.NET Core, não Supabase)
**Data:** 2026-08-04
**Pré-requisito:** `NAVEGACAO-PRODUTO.md` (regras de negócio e decisões de produto)

---

## 0. Achado que muda o âmbito do trabalho

Fui confirmar uma coisa antes de desenhar o resto: **hoje não existe nenhuma rota para ver o perfil de uma comunidade que não seja a minha.**

- `app.routes.ts` só tem `/community` (sem `:id`) — e `CommunityHomeComponent` é um dashboard 100% de membro (composer, "Membros", "Financeiro" clicáveis) montado sobre `authService.currentCommunityId`. Não é reaproveitável para a Camada C.
- A descoberta de comunidades já existe (`CommunityService.search()`, backend `GET /community/search`), mas é consumida como **modal inline no sidebar direito** (`admin-layout.component.ts:161,617`, `showSearch = true`) — resultado da busca, aderir é um clique direto (`join()`), nunca navega para uma página de perfil.
- `CommunityService.getById(id)` **já existe no serviço Angular** e já tem endpoint no backend (`GET /community/{id}`) — está pronto a usar, só não está ligado a nenhuma rota ainda.

Conclusão: isto não é "só mexer no sidebar". É preciso **criar a rota e a página de perfil público de comunidade que hoje não existem**. Isso é o essencial do trabalho — o sidebar data-driven é a parte fácil.

## 1. Estrutura de rotas — a decisão principal

As rotas atuais (`/events`, `/teaching`, `/live`, `/members`, `/financial`...) são **planas e implícitas**: todas operam sobre `authService.currentCommunityId`, nunca sobre um id explícito. Isto colide de frente com o requisito de 3 camadas, porque o mesmo nome "Eventos" precisa de **três queries diferentes** dependendo de onde se está:

| Onde | O que "Eventos" mostra |
|---|---|
| Camada A (Global) | públicos, de todas as comunidades |
| Camada B (minha comunidade) | todos os da minha comunidade (não só públicos) |
| Camada C (comunidade de outro) | só públicos, só dessa comunidade |

Uma rota só (`/events`) não consegue representar isto sem ambiguidade — precisa de saber "estou a navegar a partir de onde".

**Decisão recomendada: aninhar as rotas de comunidade sob `/communities/:id`.**

```ts
// app.routes.ts — dentro do grupo já protegido por authGuard
{
  path: 'communities/:id',
  children: [
    { path: '', loadComponent: () => CommunityProfileComponent },       // Camada B ou C, decide o componente internamente
    { path: 'events', loadComponent: () => EventsComponent },           // recebe :id via CommunityContextService
    { path: 'teaching', loadComponent: () => TeachingComponent },
    { path: 'live', loadComponent: () => LiveComponent },
    { path: 'members', canActivate: [communityMemberGuard], loadComponent: () => MembersComponent },
    { path: 'groups', canActivate: [communityMemberGuard], loadComponent: () => GroupsComponent },
    { path: 'announcements', canActivate: [communityMemberGuard], loadComponent: () => AnnouncementsComponent },
    { path: 'media', canActivate: [communityMemberGuard], loadComponent: () => MediaComponent },
    { path: 'financial', canActivate: [communityMemberGuard], loadComponent: () => FinancialComponent },
    { path: 'donations', canActivate: [communityMemberGuard], loadComponent: () => DonationsComponent },
    { path: 'billing', canActivate: [adminOnlyGuard], loadComponent: () => BillingComponent }, // ver §7.3 do doc de produto
  ]
},
// topo — só existem na Camada A
{ path: 'feed', ... },
{ path: 'events', ... },   // versão global-pública
{ path: 'live', ... },     // versão global-pública ("em direto agora", todas as comunidades)
{ path: 'community', redirectTo: (Camada B: redireciona para /communities/:minhaComunidadeId; sem comunidade: /feed) }
```

**Custo desta decisão:** os componentes (`EventsComponent`, `TeachingComponent`, `LiveComponent`, `MembersComponent`, etc.) deixam de poder ler `authService.currentCommunityId` diretamente (é isso que causa a ambiguidade hoje) e passam a ler `communityContextService.viewedCommunityId` — é uma alteração pequena por componente (troca de uma injeção por outra), mas toca em ~10 ficheiros. Não há forma de dar as 3 camadas sem tocar nestes ficheiros — a alternativa (manter rotas planas e adivinhar o contexto por outra via) seria mais frágil, não mais barata.

**Alternativa mais barata que considerei e descartei:** manter as rotas planas e só adicionar `/communities/:id` isolado para a Camada C, com nomes paralelos (`/communities/:id/events` só para visitantes, `/events` continua "a minha comunidade"). Descartei porque cria duas fontes de verdade para "o que é um evento visível" (duas queries, dois componentes ligeiramente diferentes a manter) — mais dívida técnica a prazo do que a migração de uma vez. Fica registado caso prefiras a via mais barata a curto prazo.

## 2. `CommunityContextService` — resolve a camada uma vez, todos os outros leem daqui

Novo ficheiro: `core/services/community-context.service.ts`.

```ts
@Injectable({ providedIn: 'root' })
export class CommunityContextService {
  private viewedId = signal<string | null>(null);

  constructor(private router: Router, private auth: AuthService) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const match = this.router.url.match(/^\/communities\/([^/]+)/);
        this.viewedId.set(match ? match[1] : null);
      });
  }

  readonly viewedCommunityId = this.viewedId.asReadonly();

  readonly layer = computed<'global' | 'member' | 'visitor'>(() => {
    const id = this.viewedId();
    if (!id) return 'global';
    const active = this.auth.activeMembership();
    return active?.communityId === id ? 'member' : 'visitor';
  });
}
```

Porquê assim e não a percorrer a árvore de rotas: `router.url` já dá a URL resolvida como string; ler o parâmetro com uma regex simples é mais barato e mais fácil de testar do que caminhar o `RouterState` a partir de um componente ancestor (o sidebar vive em `AdminLayoutComponent`, que é ancestor da rota ativa, não tem acesso direto ao `ActivatedRoute` do filho). Isto substitui qualquer necessidade de cada feature (`EventsComponent`, etc.) ler o `ActivatedRoute` só para saber o id — leem `communityContext.viewedCommunityId()` e já sabem em que comunidade estão, mesmo se não estiverem elas próprias na rota `/communities/:id` (ex.: quando `layer() === 'global'`, tratam `viewedCommunityId()` como `null` = "todas").

## 3. Sidebar — de hardcoded para data-driven

Novo ficheiro: `layouts/admin-layout/sidebar-config.ts`.

```ts
export type NavLayer = 'global' | 'member' | 'visitor';

export interface SidebarEntry {
  type: 'item' | 'divider';
  label: string;
  icon?: string;
  route?: string;          // relativo — resolvido com o :id atual quando necessário
  layers: NavLayer[];
  roles?: CommunityRole[]; // só relevante quando layers inclui 'member'
}

export const SIDEBAR_CONFIG: SidebarEntry[] = [
  { type: 'item', icon: '🏠', label: 'Feed', route: '/feed', layers: ['global', 'member', 'visitor'] },
  { type: 'item', icon: '📅', label: 'Eventos', route: '/events', layers: ['global'] },
  { type: 'item', icon: '📡', label: 'Cultos Online', route: '/live', layers: ['global'] },

  { type: 'item', icon: '⛪', label: 'A Comunidade', route: 'communities/:id', layers: ['member', 'visitor'] },
  { type: 'item', icon: '👥', label: 'Membros', route: 'communities/:id/members', layers: ['member'] },
  { type: 'item', icon: '👨‍👩‍👧‍👦', label: 'Grupos', route: 'communities/:id/groups', layers: ['member'] },
  { type: 'item', icon: '📅', label: 'Eventos', route: 'communities/:id/events', layers: ['member', 'visitor'] },
  { type: 'item', icon: '📢', label: 'Avisos', route: 'communities/:id/announcements', layers: ['member'] },
  { type: 'item', icon: '📸', label: 'Mídias', route: 'communities/:id/media', layers: ['member'] },
  { type: 'item', icon: '📖', label: 'Ensino', route: 'communities/:id/teaching', layers: ['member', 'visitor'] },
  { type: 'item', icon: '📡', label: 'Cultos Online', route: 'communities/:id/live', layers: ['member', 'visitor'] },

  { type: 'divider', label: 'Financeiro', layers: ['member'], roles: ['Admin', 'FinancialManager'] },
  { type: 'item', icon: '💰', label: 'Financeiro', route: 'communities/:id/financial', layers: ['member'], roles: ['Admin', 'FinancialManager'] },
  { type: 'item', icon: '💝', label: 'Doações', route: 'communities/:id/donations', layers: ['member'] },
  { type: 'item', icon: '💳', label: 'Faturação', route: 'communities/:id/billing', layers: ['member'], roles: ['Admin'] },

  { type: 'divider', label: 'Comunicação', layers: ['global', 'member', 'visitor'] },
  { type: 'item', icon: '💬', label: 'Mensagens', route: '/messages', layers: ['global', 'member', 'visitor'] },
  { type: 'item', icon: '🤝', label: 'Amigos', route: '/friends', layers: ['global', 'member', 'visitor'] },
];
```

`AdminLayoutComponent` passa a ter só:

```ts
visibleEntries = computed(() => SIDEBAR_CONFIG.filter(e =>
  e.layers.includes(this.communityContext.layer()) &&
  (!e.roles || this.auth.activeMembership()?.role in e.roles)
));
```

e o template troca o bloco de 85 linhas hardcoded por um único `*ngFor`. Isto **elimina** o `*ngIf="isAdminOrFinancial"` atual (linha ~86) sem perder o comportamento — passa a ser um caso normal da config (`roles`), tal como Faturação (nova regra, Admin-only — ver `NAVEGACAO-PRODUTO.md` §7.3) e "Minhas Doações" para quem não é Admin/FinancialManager (adiciona-se uma segunda entrada "Doações"/"Minhas Doações" com `roles` complementares, à imagem do que já existe hoje).

Nota: mantém-se `routerLinkActive` no template — a config só decide *o quê* aparece, não como o Angular marca o item ativo.

## 4. Guards

- **`communityMemberGuard`** (`CanActivateFn`): usa `CommunityContextService.layer()` — se não for `'member'`, redireciona para `communities/:id` (a versão de visitante da mesma comunidade) em vez de bloquear cegamente; se `viewedCommunityId` for null (não devia acontecer nestas rotas, mas defensivo), redireciona para `/feed`.
- **`adminOnlyGuard`**: como o anterior, mas exige `activeMembership.role === 'Admin'` especificamente — só na rota de Faturação, por causa da decisão de produto §7.3.
- Estes guards **não substituem autorização no backend** — ver §7.

## 5. Corrigir o bug do `AuthService`

Em `core/services/auth.service.ts` (linhas ~66-85), os getters leem `memberships[0]` sem checar `Status`. Troca por uma única fonte:

```ts
readonly activeMembership = computed(() =>
  this.currentUser()?.memberships?.find(m => m.status === 'Active') ?? null
);

get currentCommunityId() { return this.activeMembership()?.communityId ?? null; }
get isAdmin() { return this.activeMembership()?.role === 'Admin'; }
get isFinancialManager() { return this.activeMembership()?.role === 'FinancialManager'; }
```

Isto é uma correção isolada, sem dependência do resto do plano — pode ser a primeira tarefa, sozinha, num ficheiro só.

## 6. Modelo de dados (backend) — campos de visibilidade em falta

Confirmado: `CalendarEvent`, `Study`/`Class` e `LiveService` não têm campo de audiência. Sem isto, "públicos" não é uma query possível.

| Entidade | Campo novo | Default recomendado | Porquê |
|---|---|---|---|
| `CalendarEvent` | `Visibility: Public \| MembersOnly` (enum, à semelhança de `MembershipStatus`) | `MembersOnly` | Seguro por omissão — a comunidade decide publicar, não o contrário |
| `Study`, `Class` | idem | `MembersOnly` | idem |
| `LiveService` | `IsPublic: bool` | `true` | Decisão de produto já tomada em `NAVEGACAO-PRODUTO.md` §7.2 (cultos são ferramenta de alcance) |

Passos EF Core (backend, `src/Echurchs.Models` + `src/Echurchs.Repository`):
1. Adicionar os campos às entidades.
2. `dotnet ef migrations add AddVisibilityFields` (a partir do projeto que detém o `DbContext`).
3. Nos services (`src/Echurchs.Service`), adicionar `GetPublicAsync(Guid? communityId)`:
   - `communityId == null` → todos os `Visibility=Public` (ou `IsPublic=true`), todas as comunidades — serve a Camada A.
   - `communityId` preenchido → filtra também por `CommunityId == communityId` — serve a Camada C.
   - Camada B continua a usar o `GetAllAsync(communityId)` já existente, sem filtro de visibilidade — membro vê tudo.

**Nota sobre `LiveService`:** o frontend hoje não usa a entidade `LiveService` tipada — usa o caminho genérico `ModuleService.getAll('live-services')`, que devolve `GenericModuleItem` com `metadata: {[key:string]: string}` solto (`live.component.ts:279-300`, `core/models/module.model.ts`). Não confirmei linha a linha se `CommunityModuleService` no backend liga esse dicionário genérico ao enum `LiveServiceStatus` tipado. Antes de expor `IsPublic` também por aí, vale confirmar essa ligação — caso contrário `IsPublic` fica noutro sítio (a entidade tipada) sem chegar ao componente que hoje é realmente usado. Sinalizo isto como verificação a fazer no início da Fase 1, não como suposição.

## 7. Riscos de segurança a validar — não é para resolver aqui, é para não ignorar

1. **A única barreira hoje é `*ngIf` no template.** `authGuard` só verifica token; não há guard de Role nem de Status a nível de router, e não confirmei se os controllers do backend (`MembersController`, `FinancialController`, etc.) validam `Role`/`Status=Active` da `CommunityMembership` do chamador antes de devolver dados, ou se confiam apenas no header `X-Community-Id` (que hoje é sempre "a minha comunidade", preenchido pelo interceptor). Isto é uma pergunta de segurança **independente** desta feature — existia antes e continua a existir depois. Recomendo validar com `/secure` ou o agente `security-analyst` antes ou logo depois desta mudança, não como parte dela.
2. **Novo risco introduzido por esta feature:** ao passar a aceitar um `:id` de comunidade arbitrário nas rotas `/communities/:id/events|teaching|live`, os endpoints correspondentes no backend têm de **filtrar por `Visibility=Public` sempre que o chamador não tem membership Active nessa comunidade especificamente** — não basta reaproveitar a lógica atual do `CommunityMiddleware` (que resolve a comunidade a partir do JWT/header do chamador, não do id pedido no URL). Se o endpoint "público" for implementado a ler o `X-Community-Id` do chamador em vez do `:id` pedido, o filtro fica errado silenciosamente. Este ponto é para o backend confirmar explicitamente na Fase 1 (§8, passo 6), não assumir.

## 8. Checklist de execução (fatias pequenas, sequenciais)

**Fase 0 — correções isoladas, sem risco**
1. Corrigir `AuthService` (bug Pending≈Active) — 1 ficheiro, sem dependências.
2. Criar `CommunityContextService` (esqueleto) — 1 ficheiro novo, ainda não usado por ninguém.

**Fase 1 — dados no backend**
3. Confirmar a ligação `ModuleService` genérico ↔ `LiveService`/`LiveServiceStatus` (verificação, não código).
4. Migration + campo `Visibility`/`IsPublic` em `CalendarEvent`, `Study`, `Class`, `LiveService`.
5. `GetPublicAsync(communityId?: Guid)` nos services de Events/Teaching/Live.
6. Endpoints novos (ex. `GET /events/public?communityId=`, sem depender de `X-Community-Id`) + confirmar filtro por visibilidade independente de quem chama (§7.2).

**Fase 2 — rotas e página de perfil (frontend)**
7. Rota `/communities/:id` + `CommunityProfileComponent` novo (mínimo: dados públicos da comunidade + CTA "Pedir para entrar" / banner "pedido pendente", conforme `NAVEGACAO-PRODUTO.md` §6.2).
8. Ligar `CommunityContextService` (já criado na Fase 0) ao router — nenhum outro componente ainda depende dele.
9. Mover `EventsComponent`, `TeachingComponent`, `LiveComponent` para ler `communityContextService.viewedCommunityId()` em vez de `authService.currentCommunityId` diretamente; adicionar as rotas `communities/:id/events|teaching|live`.
10. Adicionar as rotas globais equivalentes (`/events`, `/live` no topo) a chamar `GetPublicAsync(null)`.
11. `communityMemberGuard` + `adminOnlyGuard`, aplicados às rotas member-only sob `communities/:id/*`.

**Fase 3 — sidebar**
12. `sidebar-config.ts` + refactor do template do `AdminLayoutComponent` para `*ngFor` — só depois das rotas existirem, para testar contra rotas reais em vez de placeholders.
13. Redirect de `/community` → `/communities/:minhaComunidadeId` (ou `/feed` sem comunidade).

**Fase 4 — validação de segurança (paralelo, não bloqueia o resto)**
14. `/secure` ou `security-analyst` sobre os endpoints member-only, para confirmar autorização real no backend (§7.1) — independente desta feature, mas o momento certo para revisitar é agora que a superfície de comunidades "de outros" passa a existir.

Cada passo é um ficheiro/feature isolado, como preferes trabalhar — nenhum exige os passos seguintes para ser útil por si só (ex.: o passo 1 já corrige um bug real mesmo que pares aí).
