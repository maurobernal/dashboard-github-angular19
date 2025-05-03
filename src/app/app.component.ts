import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from '@components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
imports: [RouterOutlet, CommonModule, DashboardComponent],

})
export class AppComponent {
  title = 'dashboard-github';
}
