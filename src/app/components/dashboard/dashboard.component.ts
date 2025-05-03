import { Component } from '@angular/core';
import { ListreposComponent } from './listrepos/listrepos.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [ListreposComponent],
})
export class DashboardComponent {

}
