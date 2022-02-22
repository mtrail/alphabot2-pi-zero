import {Component} from '@angular/core';
import {MessagingClient} from './messaging-client/messaging-client';
import {MatSliderChange} from '@angular/material/slider';
import {audit, BehaviorSubject, interval} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'alphabot';
  public motors = [0, 0]
  public servos = [1500, 1500]
  private leftDown = [-1, -1];
  private servo0 = new BehaviorSubject(1500);
  private servo1 = new BehaviorSubject(1500);
  private motorLeft = new BehaviorSubject(0);
  private motorRight = new BehaviorSubject(1500);

  constructor(private messaging: MessagingClient) {
    messaging.observe$("#").subscribe(message =>
      console.log(message.destinationName + ' ' + message.qos + ' ' + message.payloadString),
    );
    this.servo0.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/0', value + ''));
    this.servo1.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/1', value + ''));

    this.motorLeft.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/left', value + ''));
    this.motorRight.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/right', value + ''));
  }

  ngOnInit(): void {
  }

  public onChangeMotor($event: MatSliderChange, number: number): void {
    // this.servos[number] = $event.value;
    console.info(number, $event.value);
    if (number === 0) {
      this.motorLeft.next($event.value as number);
    }
    if (number === 1) {
      this.motorRight.next($event.value as number);
    }
  }

  public onChangeServo($event: MatSliderChange, number: number): void {
    // this.servos[number] = $event.value;
    console.info(number, $event.value);
    if (number === 0) {
      this.servo0.next($event.value as number);
    }
    if (number === 1) {
      this.servo1.next($event.value as number);
    }
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
