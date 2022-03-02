import {Component, ViewChild} from '@angular/core';
import {MessagingClient} from './messaging-client/messaging-client';
import {MatSliderChange} from '@angular/material/slider';
import {audit, BehaviorSubject, interval} from 'rxjs';
import {JoystickEvent, NgxJoystickComponent} from 'ngx-joystick';
import {JoystickManagerOptions, JoystickOutputData} from 'nipplejs';

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

  @ViewChild('dynamicJoystick') dynamicJoystick: NgxJoystickComponent | undefined;
  public dynamicOptions: JoystickManagerOptions = {
    mode: 'dynamic',
    color: 'red',
    multitouch: true,
  };
  public dynamicOutputData: JoystickOutputData | undefined;

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

  onMoveDynamic(event: JoystickEvent) {
    this.dynamicOutputData = event.data;
    if (this.dynamicOutputData) {
      console.log('dynamic x:' + this.dynamicOutputData.instance.frontPosition.x + ' y:' + this.dynamicOutputData.instance.frontPosition.y);
    }
    else {
      console.log('dynamic x: 0 y:0');
    }
  }


}
