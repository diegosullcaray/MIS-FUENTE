import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-session-loader',
  templateUrl: './session-loader.component.html',
  styleUrls: ['./session-loader.component.scss']
})
export class SessionLoaderComponent {
  @Input() message = 'Preparando espacio de trabajo...';
}
