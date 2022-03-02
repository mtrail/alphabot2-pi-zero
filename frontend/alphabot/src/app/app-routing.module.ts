import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MqttClientModule} from './mqtt-client';
import {environment} from '../environments/environment';
import {JoystickComponent} from './joystick/joystick.component';
import {SlidersComponent} from './sliders/sliders.component';

const routes: Routes = [
  {path: 'slider', component: SlidersComponent},
  {path: 'joystick', component: JoystickComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MqttClientModule.forRoot(environment.mqttConfig),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
