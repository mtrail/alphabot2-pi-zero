import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MqttClientModule} from './mqtt-client';
import {environment} from '../environments/environment';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MqttClientModule.forRoot(environment.mqttConfig),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
