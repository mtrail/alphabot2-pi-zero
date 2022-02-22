import {Component} from '@angular/core';
import {MessagingClient} from './messaging-client/messaging-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'alphabot';

  constructor(messaging: MessagingClient) {
    messaging.observe$("#").subscribe(message => console.log(message));
  }
}
