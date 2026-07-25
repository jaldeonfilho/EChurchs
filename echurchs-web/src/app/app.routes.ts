import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'feed', loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent) },
      { path: 'members', loadComponent: () => import('./features/members/members.component').then(m => m.MembersComponent) },
      { path: 'groups', loadComponent: () => import('./features/groups/groups.component').then(m => m.GroupsComponent) },
      { path: 'events', loadComponent: () => import('./features/events/events.component').then(m => m.EventsComponent) },
      { path: 'announcements', loadComponent: () => import('./features/announcements/announcements.component').then(m => m.AnnouncementsComponent) },
      { path: 'media', loadComponent: () => import('./features/media/media.component').then(m => m.MediaComponent) },
      { path: 'teaching', loadComponent: () => import('./features/teaching/teaching.component').then(m => m.TeachingComponent) },
      { path: 'live', loadComponent: () => import('./features/live/live.component').then(m => m.LiveComponent) },
      { path: 'financial', loadComponent: () => import('./features/financial/financial.component').then(m => m.FinancialComponent) },
      { path: 'donations', loadComponent: () => import('./features/donations/donations.component').then(m => m.DonationsComponent) },
      { path: 'messages', loadComponent: () => import('./features/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'friends', loadComponent: () => import('./features/friends/friends.component').then(m => m.FriendsComponent) },
      { path: 'billing', loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: '', redirectTo: 'feed', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
