import {Component} from '@angular/core';
import {MessagingClient} from '../messaging-client/messaging-client';
import {audit, BehaviorSubject, interval, map} from 'rxjs';

@Component({
  selector: 'app-joystick',
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss'],
})
export class JoystickComponent {

  public thrust = 0;
  public steering = 0;

  public servoHorizontal = 1500;
  public servoVertical = 1500;

  private leftDown = [-1, -1];
  private rightDown = [-1, -1];
  public motors = [0, 0];
  public servos = [1500, 1500];
  private servo0 = new BehaviorSubject(1500);
  private servo1 = new BehaviorSubject(1500);
  private motorLeft = new BehaviorSubject(0);
  private motorRight = new BehaviorSubject(0);

  constructor(private messaging: MessagingClient) {
    messaging.observe$("#").subscribe(message =>
      console.log(message.destinationName + ' ' + message.qos + ' ' + message.payloadString),
    );
    this.servo0.pipe(
      map(p => Math.floor(p)),
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/0', Math.max(Math.min(value, 2000), -1000) + ''));
    this.servo1.pipe(
      map(p => Math.floor(p)),
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('servos/1', Math.max(Math.min(value, 2000), -1000) + ''));

    this.motorLeft.pipe(
      map(p => Math.floor(p)),
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/left', Math.max(Math.min(value, 100), -100) + ''));
    this.motorRight.pipe(
      map(p => Math.floor(p)),
      audit(() => interval(20)),
    ).subscribe(value => this.messaging.publish('motor/right', Math.max(Math.min(value, 100), -100) + ''));
  }

  private calculateMotors(): void {
    this.motors[0] = this.thrust - this.steering;
    this.motors[1] = this.thrust + this.steering;
    this.motorLeft.next(this.motors[0]);
    this.motorRight.next(this.motors[1]);
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
      console.info('motor' + {x: x, y: y});
      this.thrust = y;
      this.steering = Math.floor(x / 10);
      this.calculateMotors();
    }
  }

  public joystickLeftTouchStart($event: TouchEvent): void {
    this.leftDown[0] = $event?.changedTouches?.item(0)?.clientX || -1;
    this.leftDown[1] = $event?.changedTouches?.item(0)?.clientY || -1;
  }

  public joystickLeftTouchEnd($event: TouchEvent): void {
    this.leftDown[0] = -1;
    this.leftDown[1] = -1;
    this.thrust = 0;
    this.steering = 0;
    this.calculateMotors();
  }

  public joystickLeftTouchMove($event: TouchEvent): void {
    if (this.leftDown[0] > 0) {
      const x = (this.leftDown[0] - ($event?.changedTouches?.item(0)?.clientX || -1));
      const y = (this.leftDown[1] - ($event?.changedTouches?.item(0)?.clientY || -1));
      this.thrust = Math.min(100, Math.max(-100, y));
      this.steering = Math.min(100, Math.max(-100, Math.floor(x / 10)));
      this.calculateMotors();
      console.info('motor x:' + x + ' y:' + y + ' thrust:' + this.thrust + ' steering:' + this.steering);
    }
  }

  public joystickRightMouseDown($event: MouseEvent): void {
    // console.info($event);
    this.rightDown[0] = $event.clientX;
    this.rightDown[1] = $event.clientY;
  }

  public joystickRightMouseEnter($event: MouseEvent): void {
    console.info($event);
    if ($event.button) {
      this.rightDown[0] = $event.clientX;
      this.rightDown[1] = $event.clientY;
    }
  }

  public joystickRightMouseUp($event: MouseEvent): void {
    // console.info($event);
    this.rightDown[0] = -1;
    this.rightDown[1] = -1;
  }

  public joystickRightMouseMove($event: MouseEvent): void {
    if (this.rightDown[0] > 0) {
      const x = this.rightDown[0] - $event.clientX;
      const y = this.rightDown[1] - $event.clientY;
      this.servoHorizontal = Math.min(2000, Math.max(1000, this.servoHorizontal + x));
      this.servoVertical = Math.min(2000, Math.max(1000, this.servoVertical + y));
      this.servo0.next(this.servoVertical);
      this.servo1.next(this.servoHorizontal);
      console.info('servos x:' + x + ' y:' + y + ' servoHorizontal:' + this.servoHorizontal + ' servoVertical:' + this.servoVertical);
    }
  }

  public joystickRightTouchStart($event: TouchEvent): void {
    this.rightDown[0] = $event?.changedTouches?.item(0)?.clientX || -1;
    this.rightDown[1] = $event?.changedTouches?.item(0)?.clientY || -1;
  }

  public joystickRightTouchEnd($event: TouchEvent): void {
    this.rightDown[0] = -1;
    this.rightDown[1] = -1;
  }

  public joystickRightTouchMove($event: TouchEvent): void {
    if (this.rightDown[0] > 0) {
      const x = (this.rightDown[0] - ($event?.changedTouches?.item(0)?.clientX || -1)) / 50.0;
      const y = (this.rightDown[1] - ($event?.changedTouches?.item(0)?.clientY || -1)) / 50.0;
      this.servoHorizontal = Math.min(2000, Math.max(1000, this.servoHorizontal - y));
      this.servoVertical = Math.min(2000, Math.max(1000, this.servoVertical + x));
      this.servo0.next(this.servoVertical);
      this.servo1.next(this.servoHorizontal);
      console.info('servos x:' + x + ' y:' + y + ' servoHorizontal:' + this.servoHorizontal + ' servoVertical:' + this.servoVertical);
    }
  }
}
