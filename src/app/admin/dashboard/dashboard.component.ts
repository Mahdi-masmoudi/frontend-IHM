import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../theme/shared/shared.module';

@Component({
  selector: 'app-admin-dashboard',
  imports: [SharedModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {}
