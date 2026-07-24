import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: ``,
  styles: [`:host { display: block; }`]
})
export class DashboardComponent {
  constructor(private router: Router) {
    this.router.navigate(['/feed']);
  }
}
