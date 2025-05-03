import { Component, inject, Inject } from '@angular/core';
import { ListreposComponent } from './listrepos/listrepos.component';
import { Kpi1Component } from './kpi1/kpi1.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [ListreposComponent, Kpi1Component],
})
export class DashboardComponent {

}
