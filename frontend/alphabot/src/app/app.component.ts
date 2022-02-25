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
  public thrust = 0;
  public steering = 0;
  public motors = [0, 0];
  public servos = [1500, 1500];
  private leftDown = [-1, -1];
  private servo0 = new BehaviorSubject(1500);
  private servo1 = new BehaviorSubject(1500);
  private motorLeft = new BehaviorSubject(0);
  private motorRight = new BehaviorSubject(0);

  constructor(private messaging: MessagingClient) {
    messaging.observe$("#").subscribe(message =>
      console.log(message.destinationName + ' ' + message.qos + ' ' + message.payloadString),
    );
    this.servo0.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/0', Math.max(Math.min(value, 2000), -1000) + ''));
    this.servo1.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/1', Math.max(Math.min(value, 2000), -1000) + ''));

    this.motorLeft.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/left', Math.max(Math.min(value, 100), -100) + ''));
    this.motorRight.pipe(
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/right', Math.max(Math.min(value, 100), -100) + ''));
  }

  ngOnInit(): void {
  }

  public onThrustChange($event: MatSliderChange): void {
    this.thrust = $event.value as number;
    this.calculateMotors();
  }

  public onSteeringChange($event: MatSliderChange): void {
    this.steering = $event.value as number;
    this.calculateMotors();
  }

  private calculateMotors(): void {
    this.motors[0] = this.thrust - this.steering;
    this.motors[1] = this.thrust + this.steering;
    this.motorLeft.next(this.motors[0]);
    this.motorRight.next(this.motors[1]);
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

    this.thrust = 0;
    this.steering = 0;
    this.calculateMotors();
  }

  public joystickLeftMouseMove($event: MouseEvent): void {
    if (this.leftDown[0] > 0) {
      const x = this.leftDown[0] - $event.clientX;
      const y = this.leftDown[1] - $event.clientY;
      console.info({x: x, y: y});
      this.thrust = y;
      this.steering = Math.floor(x / 10);
      this.calculateMotors();
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
