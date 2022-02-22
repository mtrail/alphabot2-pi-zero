import {Component} from '@angular/core';
import {MessagingClient} from './messaging-client/messaging-client';
import {MatSliderChange} from '@angular/material/slider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'alphabot';
  public servos = Array(4).fill(1500);
  private leftDown = [-1, -1];

  constructor(private messaging: MessagingClient) {
    messaging.observe$("#").subscribe(message =>
      console.log(message.destinationName + ' ' + message.qos + ' ' + message.payloadString),
    );
  }

  ngOnInit(): void {
  }

  public onChange($event: MatSliderChange, number: number): void {
    // this.servos[number] = $event.value;
    console.info(number, $event.value);
    this.messaging.publish('/servo/pwm', '{"' + number + '": ' + ($event.value) + '}');
  }

  public indexTracker(index: number, value: any): number {
    return index;
  }

  public joystickLeftMouseDown($event: MouseEvent): void {
    // console.info($event);
    this.leftDown[0] = $event.clientX;
    this.leftDown[1] = $event.clientY;
  }

  public joystickLeftMouseEnter($event: MouseEvent): void {
    console.info($event);
    if ($event.button) {
      this.leftDown[0] = $event.clientX;
      this.leftDown[1] = $event.clientY;
    }
  }

  public joystickLeftMouseUp($event: MouseEvent): void {
    // console.info($event);
    this.leftDown[0] = -1;
    this.leftDown[1] = -1;
  }

  public joystickLeftMouseMove($event: MouseEvent): void {
    if (this.leftDown[0] > 0) {
      console.info({x: this.leftDown[0] - $event.clientX, y: this.leftDown[1] - $event.clientY});
    }
  }

  public joystickRightMouseDown($event: MouseEvent): void {
    // console.info($event);
  }

  public joystickRightMouseUp($event: MouseEvent): void {
    // console.info($event);
  }

  public joystickRightMouseMove($event: MouseEvent): void {
    // console.info($event);
  }
}
