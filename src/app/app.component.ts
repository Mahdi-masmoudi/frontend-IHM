// Angular import
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'Recrutement Platform';
}
