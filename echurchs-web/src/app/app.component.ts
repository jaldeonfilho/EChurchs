import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpgradeModalComponent } from './core/components/upgrade-modal/upgrade-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UpgradeModalComponent],
  template: '<router-outlet></router-outlet><app-upgrade-modal></app-upgrade-modal>'
})
export class AppComponent {
  title = 'echurchs-web';
}
