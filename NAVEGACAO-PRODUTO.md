# Navegação EChurchs — Plano de Produto (Global vs Comunidade)

**Autor:** análise de produto (skill `/analista-produto`)
**Data:** 2026-08-04
**Estado:** proposta para validação — contém decisões abertas marcadas com ⚠️
**Complementa:** `ARCHITECTURE.md` (modelo de dados) · ver `NAVEGACAO-ARQUITETURA.md` para o plano técnico Angular

---

## 1. Contexto e problema

O EChurchs é uma rede social de igrejas: cada `Community` é uma igreja/tenant, cada `User` tem no máximo 1 `CommunityMembership` ativa. Hoje o sidebar (`admin-layout.component.ts`) é **um único menu estático**, igual para todos os utilizadores autenticados, com apenas um `*ngIf` (`isAdminOrFinancial`) a variar a secção Financeiro. Não existe distinção entre:

- estar a navegar "no geral" (fora de qualquer comunidade) vs. dentro do perfil de uma comunidade específica;
- ser membro dessa comunidade vs. ser visitante.

Isto cria dois problemas de produto:
1. **Sobrecarga cognitiva** — um visitante ou um utilizador sem comunidade vê itens de menu (Grupos, Financeiro, Faturação) que não lhe dizem nada ou aos quais não devia ter acesso.
2. **Sem motor de descoberta/crescimento** — não há hoje um "espaço público" (feed/eventos/cultos globais) que funcione como porta de entrada para quem ainda não pertence a nenhuma igreja. Isto é o motor de aquisição do produto (equivalente ao que uma página pública de grupo é no Facebook, ou uma página de evento no Meetup).

## 2. O que o código atual já garante (grounding)

Confirmado na exploração do repositório:

- **1 comunidade por utilizador.** `CommunityMembership` — no máximo 1 registo `Active` por `User` (`CommunityService.cs`). Logo, "visitar uma comunidade da qual não sou membro" é sempre verdade para qualquer comunidade que não seja a `currentCommunityId` do utilizador — não há caso de "sou membro de duas comunidades".
- **Feed é global por natureza, não por comunidade.** `FeedService.GetFeedAsync` já devolve posts e eventos de **todas** as comunidades, sem filtro. Ou seja: não existe hoje (nem faz sentido inventar) um "feed da minha comunidade" separado do feed global — o item "Feed" deve apontar sempre para o mesmo destino, em qualquer um dos três menus. Isto simplifica a tua especificação: o botão "Feed" dentro do sidebar de comunidade não é uma feature nova, é o mesmo link que já existe.
- **Hierarquia de papéis já existe e é mais fina do que "membro".** `CommunityRole`: Admin | FinancialManager | Leader | Member. O sidebar "Comunidade" que colaste no pedido é, na realidade, **a vista de um Admin** — um Member comum já hoje vê menos (ex.: "Minhas Doações" em vez do bloco Financeiro completo, via `isAdminOrFinancial`). O plano tem de **preservar esta camada de papel dentro da camada de membership**, não substituí-la.
- **Amizades (`Friendship`) são entre utilizadores, não entre comunidades.** Um membro da Igreja A pode ser amigo de um membro da Igreja B. Isto tem implicação direta no menu Global (ver §6.4).

## 3. Gaps de dados que bloqueiam a especificação (⚠️ decisões necessárias antes de implementar)

A tua regra é "mostrar tudo o que for **público**" em Eventos, Ensino, Cultos Online. O código atual **não tem esse conceito**:

| Entidade | Campo de visibilidade hoje | Gap |
|---|---|---|
| `Community` | nenhum (toda a `IsActive` é pesquisável e pedível) | Não existe "comunidade privada". Ver §7.1 |
| `CalendarEvent` (Eventos) | nenhum | Precisa de `Visibility: Public \| MembersOnly` |
| `Study`/`Class` (Ensino) | nenhum | Idem |
| `LiveService` (Cultos Online) | tem `Status` (Scheduled/Live/Ended/Cancelled) mas nenhum campo de audiência | Precisa de `IsPublic` (ver §7.2 sobre o default) |
| Posts do feed | nenhum campo "publicado como global" | O teu requisito "Feed = tudo que for publicado como global" pressupõe um campo que ainda não existe — hoje o feed já é 100% global por omissão (todas as comunidades), então **não há como marcar algo como "não-global"** |

Sem estes campos, "Eventos públicos" e "Ensino público" não são filtráveis — é trabalho de modelo de dados, não só de sidebar. Estou a assinalar isto explicitamente para o `/arquiteto` incluir no plano técnico como pré-requisito, não como detalhe de implementação tardio.

Encontrei também um **bug ativo**: `AuthService` (getters `currentCommunityId`/`isAdmin`/etc.) lê `memberships[0]` sem verificar `Status === Active`. Na prática, hoje, **um utilizador com pedido de entrada `Pending` já é tratado como membro pleno** na sidebar. Isto tem de ser corrigido como parte desta mudança — não é opcional, porque a tua Camada 3 (não-membro) depende de saber distinguir Pending de Active.

## 4. As três camadas de navegação (+ 1 sub-camada de papel)

| Camada | Quando se aplica | O que muda |
|---|---|---|
| **A — Global** | Utilizador autenticado, fora de qualquer página de comunidade (inclui quem não tem `Community`, e qualquer membro/admin quando está fora do perfil de uma comunidade) | Sidebar reduzido: Feed, Eventos (públicos, todas as comunidades), Cultos Online (em direto agora, todas as comunidades) |
| **B — Comunidade / Membro** | Utilizador está na página de perfil de uma `Community` onde tem `CommunityMembership.Status = Active` | Sidebar completo (Feed, A Comunidade, Membros, Grupos, Eventos, Avisos, Mídias, Ensino, Cultos Online, Financeiro/Doações/Faturação, Mensagens, Amigos) — **com o papel (Role) a continuar a filtrar dentro desta camada**, como já acontece hoje |
| **C — Comunidade / Não-membro** | Utilizador está na página de perfil de uma `Community` onde **não** tem membership Active (inclui: nunca pediu, `Pending`, `Rejected`, `Left`) | Sidebar reduzido: Feed, A Comunidade, Eventos (só públicos desta comunidade), Ensino (só público), Cultos Online, + Mensagens/Amigos |

A "sub-camada de papel" dentro de B não é nova — é a que já existe (`isAdminOrFinancial` e o que está descrito em `ARCHITECTURE.md` §Hierarquia). Recomendo explicitamente **não a colapsar**: Faturação (gestão da subscrição/plano da comunidade) é uma ação de negócio sensível — proponho restringi-la a Admin apenas (hoje o código dá-a a Admin+FinancialManager juntamente com o resto do bloco Financeiro; ⚠️ confirma se isso é intencional ou se Faturação devia sair desse bloco e ficar só para Admin).

## 5. Regras de visibilidade de conteúdo, por camada

- **Camada A (Feed):** todos os posts/eventos que o `FeedService` já devolve hoje (é global). Nenhuma mudança de query necessária aqui — só a UI do sidebar muda.
- **Camada A (Eventos):** `CalendarEvent` com `Visibility = Public`, de qualquer comunidade, ordenado por data.
- **Camada A (Cultos Online):** `LiveService` com `Status = Live` **neste momento**, de qualquer comunidade (ver decisão de default em §7.2).
- **Camada C (Eventos, Ensino):** apenas os itens com `Visibility = Public` **desta comunidade específica** (é o mesmo filtro da Camada A, só que restrito a `CommunityId`).
- **Camada C (A Comunidade):** vista pública do perfil — nome, descrição, logo, contactos, talvez contagem de membros. Sem dados internos.
- **Camada B:** sem filtro de visibilidade — membro ativo vê tudo o que o papel permite (comportamento atual, já implementado).

## 6. Estados, transições e o que acontece "a meio da navegação"

### 6.1 Utilizador sem nenhuma comunidade
Vê sempre a Camada A. A sidebar direita de onboarding ("Criar Comunidade" / "Entrar numa Comunidade") que já existe hoje **mantém-se** — é o CTA de conversão para saída da Camada A. Não a removas ao simplificar o sidebar esquerdo.

### 6.2 Pedido de entrada pendente (`Status = Pending`)
Ao visitar o perfil dessa comunidade específica, o utilizador está na **Camada C** (não é membro ainda), mas com um estado visual diferente de um visitante genérico: mostrar banner "O teu pedido de entrada está pendente de aprovação" em vez do botão "Pedir para entrar". Microcopy sugerido:
> "O teu pedido para te juntares a **{{nome da comunidade}}** está a aguardar aprovação de um administrador."

### 6.3 Saída ou rejeição (`Left` / `Rejected`)
O utilizador volta ao estado "sem comunidade" (Camada A por defeito) — porque só pode ter 1 membership ativa, perder essa membership não deixa nenhuma outra em standby. Se visitar de novo o perfil dessa mesma comunidade, vê a Camada C como qualquer visitante (pode voltar a pedir entrada, exceto se a regra de negócio quiser bloquear reentrada após `Rejected` — ⚠️ não encontrei essa regra no código, presumo que hoje é permitido pedir de novo).

### 6.4 Mensagens/Amigos para quem não tem comunidade ⚠️
A tua especificação não inclui Mensagens/Amigos na Camada A. Mas o modelo `Friendship` é **entre utilizadores**, independente de comunidade — um utilizador sem comunidade pode, em teoria, já ter amigos de quando pertencia a outra, ou pode querer ser convidado antes de decidir aderir a uma igreja. Tal como está especificado, esse utilizador **fica sem acesso a Mensagens/Amigos** até entrar numa comunidade (mesmo que como visitante — a Camada C já os inclui). Três opções, a decidir:

1. **Manter como especificaste** (mais simples): Mensagens/Amigos só aparecem a partir do momento em que se visita uma comunidade (B ou C). Efeito colateral: um convite de amizade recebido por alguém sem comunidade fica "invisível" até essa pessoa entrar numa comunidade qualquer.
2. Adicionar Mensagens/Amigos também à Camada A.
3. Mostrar um badge de notificação (ex. no avatar/menu de utilizador, fora do sidebar de navegação) mesmo na Camada A, mesmo sem o item de menu completo.

Recomendo 🟢 a opção 2 (baixo esforço — é reaproveitar o item de menu que já existe, só muda em que camadas aparece) porque a mensagens/amizade não depende de comunidade no modelo de dados; impedir o acesso pareceria um bug a um utilizador que já tinha amigos antes.

### 6.5 Logo e retorno ao início
Confirmado como especificaste: o logótipo, em qualquer camada, aponta sempre para o Feed global (Camada A). Dentro da Camada B/C, o item "Feed" do próprio sidebar tem o mesmo destino — não há "feed da comunidade" separado (ver §2). Não é preciso construir dois destinos diferentes.

## 7. Decisões abertas (⚠️ preciso da tua confirmação antes de passar ao plano técnico)

### 7.1 Comunidades privadas
Não existem hoje. A tua pergunta original mencionava "comunidade privada vs pública" como edge case. Proposta: **não construir isso nesta iteração** — todas as comunidades continuam descobríveis (como já é), a única coisa que muda é *quanto conteúdo* um não-membro vê dentro do perfil (Camada C), não *se* consegue ver que a comunidade existe. Marcar "Community.Visibility" como 🔵 melhoria futura, não bloqueante para este plano.

### 7.2 Cultos Online — público por defeito?
Proponho `LiveService.IsPublic = true` por defeito. Justificação de produto: transmitir cultos é tipicamente uma ferramenta de alcance/evangelismo (igrejas querem partilhar o link amplamente, não esconder), ao contrário de dados financeiros. Uma comunidade que queira um culto privado (ex. reunião de liderança) marca-o como não-público. ⚠️ Confirma se concordas com este default — é uma decisão de produto, não técnica.

### 7.3 Faturação — só Admin?
Ver §4. Faturação (gestão de subscrição/plano) é uma ação de negócio distinta de "ver o extrato financeiro da comunidade". Recomendo separá-la do bloco Financeiro e restringi-la a Admin. ⚠️ Confirma.

### 7.4 Reentrada após `Rejected`
Confirma se um utilizador rejeitado pode voltar a pedir entrada na mesma comunidade, e se há um período de espera.

## 8. Nota de benchmark (setor: rede social + gestão de igreja)

O EChurchs não é um ChMS clássico de single-tenant como Planning Center, Breeze ou ChurchTrac — esses não têm o conceito de "visitante a navegar por várias comunidades". A dualidade que estás a construir (página pública de comunidade vs. vista de membro) é estruturalmente mais parecida com **Grupos do Facebook** (pré-visualização pública de um grupo antes de aderir) ou a **página pública de evento do Meetup**. Vale a pena olhar para esses dois como referência de padrão de UI para a Camada C, mais do que para software de gestão de igreja tradicional — nenhum concorrente direto do setor resolve exatamente este problema porque nenhum deles é multi-tenant social.

## 9. Recomendações priorizadas

- 🟢 Corrigir o bug `AuthService` (Pending tratado como Active) — pré-requisito de segurança/correção, não feature nova.
- 🟢 Adicionar Mensagens/Amigos também à Camada A (§6.4, opção 2).
- 🟢 `LiveService.IsPublic` com default `true`.
- 🟡 `CalendarEvent.Visibility` (Public/MembersOnly) + filtro nas queries de Camada A e C.
- 🟡 `Study`/`Class.Visibility` (mesmo padrão, para o item Ensino).
- 🟡 Banner de estado "pedido pendente" na Camada C (§6.2).
- 🔵 `Community.Visibility` (pública/privada) — não bloqueante, futuro.

## 10. Critérios de aceitação (para handoff ao plano técnico)

1. Utilizador sem comunidade vê apenas Feed, Eventos públicos (todas as comunidades), Cultos Online em direto (todas as comunidades) + Mensagens/Amigos.
2. Utilizador com membership `Active` numa comunidade, ao visitar o perfil dessa comunidade, vê o sidebar completo, filtrado pelo seu `Role` (comportamento atual preservado).
3. Utilizador sem membership `Active` numa comunidade (nunca pediu, `Pending`, `Rejected` ou `Left`), ao visitar o perfil dessa comunidade, vê apenas Feed, A Comunidade, Eventos públicos desta comunidade, Ensino público desta comunidade, Cultos Online + Mensagens/Amigos.
4. `Pending` nunca é tratado como `Active` em nenhum getter/guard.
5. O logótipo e o item "Feed", em qualquer camada, levam sempre ao mesmo Feed global.
6. Saída da comunidade (`Left`) devolve o utilizador à Camada A.
